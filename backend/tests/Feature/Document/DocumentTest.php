<?php

namespace Tests\Feature\Document;

use App\Models\Document;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Tests\Traits\CreatesTestData;

class DocumentTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    private User $admin;

    private Lead $lead;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create(['phone_verified' => true]);

        $agent = $this->createVerifiedAgent();
        $property = $this->createApprovedProperty($agent['profile']);

        $this->lead = Lead::factory()->create([
            'property_id' => $property->id,
            'agent_id' => $agent['profile']->id,
        ]);
    }

    // ── Index ─────────────────────────────────────────────────

    public function test_admin_can_list_documents_for_lead(): void
    {
        Document::factory()->count(3)->create([
            'lead_id' => $this->lead->id,
            'uploaded_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/v1/admin/inquiries/{$this->lead->id}/documents");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data');
    }

    // ── Store ─────────────────────────────────────────────────

    public function test_admin_can_upload_document(): void
    {
        Storage::fake('private');

        $file = UploadedFile::fake()->create('contract.pdf', 1024, 'application/pdf');

        $response = $this->actingAs($this->admin)
            ->postJson("/api/v1/admin/inquiries/{$this->lead->id}/documents", [
                'file' => $file,
                'type' => 'buyer_agreement',
                'title' => 'Buyer Agreement 2026',
                'notes' => 'Signed copy.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.type', 'buyer_agreement')
            ->assertJsonPath('data.title', 'Buyer Agreement 2026')
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('documents', [
            'lead_id' => $this->lead->id,
            'uploaded_by' => $this->admin->id,
            'type' => 'buyer_agreement',
        ]);
    }

    public function test_upload_validates_required_fields(): void
    {
        Storage::fake('private');

        $response = $this->actingAs($this->admin)
            ->postJson("/api/v1/admin/inquiries/{$this->lead->id}/documents", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file', 'type', 'title']);
    }

    public function test_upload_rejects_invalid_file_type(): void
    {
        Storage::fake('private');

        $file = UploadedFile::fake()->create('malware.exe', 500, 'application/x-msdownload');

        $response = $this->actingAs($this->admin)
            ->postJson("/api/v1/admin/inquiries/{$this->lead->id}/documents", [
                'file' => $file,
                'type' => 'other',
                'title' => 'Some Document',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    public function test_upload_rejects_oversized_file(): void
    {
        Storage::fake('private');

        $file = UploadedFile::fake()->create('large.pdf', 11264, 'application/pdf');

        $response = $this->actingAs($this->admin)
            ->postJson("/api/v1/admin/inquiries/{$this->lead->id}/documents", [
                'file' => $file,
                'type' => 'proof_of_funds',
                'title' => 'Bank Statement',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    // ── Download ──────────────────────────────────────────────

    public function test_admin_can_download_document(): void
    {
        Storage::fake('private');

        $filePath = "documents/{$this->lead->id}/test-file.pdf";
        Storage::disk('private')->put($filePath, 'PDF content here');

        $document = Document::factory()->create([
            'lead_id' => $this->lead->id,
            'uploaded_by' => $this->admin->id,
            'file_path' => $filePath,
            'file_name' => 'test-file.pdf',
            'mime_type' => 'application/pdf',
        ]);

        $response = $this->actingAs($this->admin)
            ->get("/api/v1/admin/documents/{$document->id}/download");

        $response->assertOk()
            ->assertDownload('test-file.pdf');
    }

    public function test_download_returns_404_for_missing_file(): void
    {
        Storage::fake('private');

        $document = Document::factory()->create([
            'lead_id' => $this->lead->id,
            'uploaded_by' => $this->admin->id,
            'file_path' => 'documents/nonexistent/missing.pdf',
            'file_name' => 'missing.pdf',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson("/api/v1/admin/documents/{$document->id}/download");

        $response->assertStatus(404);
    }

    // ── Update Status ─────────────────────────────────────────

    public function test_admin_can_update_document_status(): void
    {
        $document = Document::factory()->create([
            'lead_id' => $this->lead->id,
            'uploaded_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->putJson("/api/v1/admin/documents/{$document->id}/status", [
                'status' => 'approved',
                'notes' => 'Looks good.',
            ]);

        $response->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('documents', [
            'id' => $document->id,
            'status' => 'approved',
        ]);
    }

    // ── Delete ────────────────────────────────────────────────

    public function test_admin_can_delete_document(): void
    {
        Storage::fake('private');

        $filePath = "documents/{$this->lead->id}/to-delete.pdf";
        Storage::disk('private')->put($filePath, 'content');

        $document = Document::factory()->create([
            'lead_id' => $this->lead->id,
            'uploaded_by' => $this->admin->id,
            'file_path' => $filePath,
        ]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/v1/admin/documents/{$document->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('documents', [
            'id' => $document->id,
        ]);

        Storage::disk('private')->assertMissing($filePath);
    }

    // ── Authorization ─────────────────────────────────────────

    public function test_non_admin_cannot_update_document_status(): void
    {
        $regularUser = $this->createVerifiedUser();

        $document = Document::factory()->create([
            'lead_id' => $this->lead->id,
            'uploaded_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($regularUser)
            ->putJson("/api/v1/admin/documents/{$document->id}/status", [
                'status' => 'approved',
            ]);

        $response->assertStatus(403);
    }

    public function test_filename_is_sanitized_on_upload(): void
    {
        Storage::fake('private');

        $file = UploadedFile::fake()->create('../../etc/passwd.pdf', 100, 'application/pdf');

        $response = $this->actingAs($this->admin)
            ->postJson("/api/v1/admin/inquiries/{$this->lead->id}/documents", [
                'file' => $file,
                'type' => 'other',
                'title' => 'Sneaky File',
            ]);

        $response->assertStatus(201);

        $document = Document::query()->latest('created_at')->first();

        $this->assertStringNotContainsString('..', $document->file_name);
        $this->assertStringNotContainsString('/', $document->file_name);
        $this->assertStringNotContainsString('\\', $document->file_name);
    }

    public function test_unauthenticated_cannot_access_documents(): void
    {
        $response = $this->getJson("/api/v1/admin/inquiries/{$this->lead->id}/documents");
        $response->assertUnauthorized();

        $response = $this->postJson("/api/v1/admin/inquiries/{$this->lead->id}/documents", []);
        $response->assertUnauthorized();
    }
}
