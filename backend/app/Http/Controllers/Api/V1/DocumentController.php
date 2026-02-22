<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Lead;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    use ApiResponse;

    /**
     * List documents for a lead.
     */
    public function index(Request $request, Lead $lead): JsonResponse
    {
        $docs = $lead->documents()
            ->with('uploader:id,first_name,last_name')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Document $doc) => $this->formatDocument($doc));

        return $this->successResponse($docs);
    }

    /**
     * Upload a document for a lead.
     */
    public function store(Request $request, Lead $lead): JsonResponse
    {
        $request->validate([
            'file'  => ['required', 'file', 'max:10240'], // 10MB max
            'type'  => ['required', 'in:buyer_agreement,proof_of_funds,id_verification,offer_letter,other'],
            'title' => ['required', 'string', 'max:200'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $file = $request->file('file');
        $path = $file->store("documents/{$lead->id}", 'private');

        $document = Document::create([
            'lead_id'     => $lead->id,
            'uploaded_by' => $request->user()->id,
            'type'        => $request->input('type'),
            'title'       => $request->input('title'),
            'file_path'   => $path,
            'file_name'   => $file->getClientOriginalName(),
            'mime_type'   => $file->getMimeType(),
            'file_size'   => $file->getSize(),
            'notes'       => $request->input('notes'),
            'status'      => 'pending',
        ]);

        $document->load('uploader:id,first_name,last_name');

        return $this->successResponse(
            $this->formatDocument($document),
            'Document uploaded.',
            201
        );
    }

    /**
     * Download a document.
     */
    public function download(Document $document)
    {
        if (!Storage::disk('private')->exists($document->file_path)) {
            return $this->errorResponse('File not found.', 404);
        }

        return Storage::disk('private')->download(
            $document->file_path,
            $document->file_name
        );
    }

    /**
     * Update document status (approve/reject).
     */
    public function updateStatus(Request $request, Document $document): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected'],
            'notes'  => ['nullable', 'string', 'max:1000'],
        ]);

        $document->update($data);

        return $this->successResponse(null, 'Document status updated.');
    }

    /**
     * Delete a document.
     */
    public function destroy(Document $document): JsonResponse
    {
        Storage::disk('private')->delete($document->file_path);
        $document->delete();

        return response()->json(null, 204);
    }

    private function formatDocument(Document $doc): array
    {
        return [
            'id'          => $doc->id,
            'type'        => $doc->type,
            'title'       => $doc->title,
            'file_name'   => $doc->file_name,
            'mime_type'   => $doc->mime_type,
            'file_size'   => $doc->file_size,
            'notes'       => $doc->notes,
            'status'      => $doc->status,
            'uploaded_by' => $doc->uploader ? [
                'id'        => $doc->uploader->id,
                'full_name' => $doc->uploader->full_name,
            ] : null,
            'created_at' => $doc->created_at?->toIso8601String(),
        ];
    }
}
