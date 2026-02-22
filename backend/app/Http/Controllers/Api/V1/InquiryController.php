<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lead\CreateInquiryRequest;
use App\Models\Lead;
use App\Models\Property;
use App\Models\User;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected NotificationService $notificationService,
    ) {}

    // ── Public ─────────────────────────────────────────────

    public function store(CreateInquiryRequest $request): JsonResponse
    {
        $data = $request->validated();

        $property = Property::with('agent')->findOrFail($data['property_id']);
        $user = $request->user();

        // Build lead fields
        $leadData = [
            'property_id'    => $property->id,
            'agent_id'       => $property->agent_id,
            'user_id'        => $user?->id,
            'contact_type'   => 'form',
            'full_name'      => $data['full_name'] ?? $user?->full_name,
            'email'          => $data['email'] ?? $user?->email,
            'phone'          => $data['phone'] ?? $user?->phone,
            'budget_range'   => $data['budget_range'] ?? null,
            'timeline'       => $data['timeline'] ?? null,
            'financing_type' => $data['financing_type'] ?? null,
            'message'        => $data['message'] ?? null,
            'source'         => $data['source'] ?? null,
            'status'         => 'new',
        ];

        // Smart assignment: high-value properties (>₦300M) → super_admin, else round-robin
        $highValueThreshold = 30_000_000_000; // ₦300M in kobo
        $isHighValue = $property->price_kobo >= $highValueThreshold;

        $staffQuery = User::where('status', 'active')
            ->withCount(['assignedInquiries' => fn ($q) => $q->whereNotIn('status', ['closed_won', 'closed_lost'])])
            ->orderBy('assigned_inquiries_count', 'asc');

        if ($isHighValue) {
            // High-value: prefer super_admin, fall back to admin
            $staffMember = (clone $staffQuery)->where('role', 'super_admin')->first()
                ?? $staffQuery->whereIn('role', ['admin', 'super_admin'])->first();
        } else {
            // Standard: round-robin across all admin staff
            $staffMember = $staffQuery->whereIn('role', ['admin', 'super_admin'])->first();
        }

        if ($staffMember) {
            $leadData['assigned_to'] = $staffMember->id;
        }

        $lead = Lead::create($leadData);

        // Increment counters
        $property->increment('contact_count');
        if ($property->agent) {
            $property->agent->increment('total_leads');
        }

        // Notify assigned staff
        if ($staffMember) {
            $this->notificationService->send(
                $staffMember,
                "New inquiry for {$property->title}",
                "{$leadData['full_name']} is interested in viewing this property.",
                'new_inquiry',
                ['action_type' => 'inquiry', 'action_id' => $lead->id, 'action_url' => '/admin/inquiries'],
            );
        }

        return $this->successResponse(
            ['inquiry_id' => $lead->id],
            'Thank you! Our team will contact you within 2 hours to arrange your private viewing.',
            201
        );
    }

    // ── Admin ──────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $query = Lead::with(['property:id,title,slug,price_kobo,agent_id', 'assignedStaff:id,first_name,last_name'])
            ->whereNotNull('status')
            ->where('status', '!=', '');

        if ($status = $request->query('status')) {
            $query->byStatus($status);
        }
        if ($assignedTo = $request->query('assigned_to')) {
            $query->byAssignedTo($assignedTo);
        }
        if ($from = $request->query('from')) {
            $query->where('created_at', '>=', $from);
        }
        if ($to = $request->query('to')) {
            $query->where('created_at', '<=', $to);
        }
        if ($qualification = $request->query('qualification')) {
            $query->byQualification($qualification);
        }

        $paginator = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        // Format items for admin view
        $items = collect($paginator->items())->map(fn (Lead $lead) => [
            'id'             => $lead->id,
            'full_name'      => $lead->full_name,
            'phone'          => $lead->phone,
            'email'          => $lead->email,
            'budget_range'   => $lead->budget_range,
            'timeline'       => $lead->timeline,
            'financing_type'  => $lead->financing_type,
            'status'          => $lead->status,
            'qualification'   => $lead->qualification,
            'assigned_to'     => $lead->assignedStaff ? [
                'id'        => $lead->assignedStaff->id,
                'full_name' => $lead->assignedStaff->full_name,
            ] : null,
            'property' => $lead->property ? [
                'id'              => $lead->property->id,
                'title'           => $lead->property->title,
                'slug'            => $lead->property->slug,
                'formatted_price' => '₦' . number_format($lead->property->price_kobo / 100, 0, '.', ','),
            ] : null,
            'created_at' => $lead->created_at?->toIso8601String(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data'    => $items,
            'meta'    => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ]);
    }

    public function show(Lead $lead): JsonResponse
    {
        $lead->load([
            'property:id,title,slug,price_kobo,agent_id',
            'property.agent:id,company_name,user_id',
            'property.agent.user:id,first_name,last_name',
            'assignedStaff:id,first_name,last_name',
            'user:id,first_name,last_name',
        ]);

        return $this->successResponse([
            'id'             => $lead->id,
            'full_name'      => $lead->full_name,
            'phone'          => $lead->phone,
            'email'          => $lead->email,
            'budget_range'   => $lead->budget_range,
            'timeline'       => $lead->timeline,
            'financing_type' => $lead->financing_type,
            'message'        => $lead->message,
            'status'         => $lead->status,
            'qualification'  => $lead->qualification,
            'staff_notes'    => $lead->staff_notes,
            'assigned_to'    => $lead->assignedStaff ? [
                'id'        => $lead->assignedStaff->id,
                'full_name' => $lead->assignedStaff->full_name,
            ] : null,
            'property' => $lead->property ? [
                'id'              => $lead->property->id,
                'title'           => $lead->property->title,
                'slug'            => $lead->property->slug,
                'formatted_price' => '₦' . number_format($lead->property->price_kobo / 100, 0, '.', ','),
            ] : null,
            'agent' => $lead->property?->agent ? [
                'company_name' => $lead->property->agent->company_name,
                'user_name'    => $lead->property->agent->user?->full_name,
            ] : null,
            'user' => $lead->user ? [
                'id'        => $lead->user->id,
                'full_name' => $lead->user->full_name,
            ] : null,
            'qualified_at'  => $lead->qualified_at?->toIso8601String(),
            'inspection_at' => $lead->inspection_at?->toIso8601String(),
            'closed_at'     => $lead->closed_at?->toIso8601String(),
            'created_at'    => $lead->created_at?->toIso8601String(),
        ]);
    }

    public function updateStatus(Request $request, Lead $lead): JsonResponse
    {
        $data = $request->validate([
            'status'        => ['required', 'in:new,contacted,qualified,agreement_signed,inspection_scheduled,negotiating,offer_made,closed_won,closed_lost'],
            'qualification' => ['nullable', 'in:qualified,not_qualified,cold,fake'],
            'staff_notes'   => ['nullable', 'string', 'max:2000'],
        ]);

        $updates = ['status' => $data['status']];

        if (array_key_exists('qualification', $data)) {
            $updates['qualification'] = $data['qualification'];
        }

        if (array_key_exists('staff_notes', $data)) {
            $updates['staff_notes'] = $data['staff_notes'];
        }

        // Auto-set timestamps based on status transitions
        if ($data['status'] === 'qualified' && !$lead->qualified_at) {
            $updates['qualified_at'] = now();
        }
        if ($data['status'] === 'inspection_scheduled' && !$lead->inspection_at) {
            $updates['inspection_at'] = now();
        }
        if (in_array($data['status'], ['closed_won', 'closed_lost']) && !$lead->closed_at) {
            $updates['closed_at'] = now();
        }

        $lead->update($updates);

        return $this->successResponse(null, 'Status updated.');
    }

    public function assign(Request $request, Lead $lead): JsonResponse
    {
        $data = $request->validate([
            'assigned_to' => ['required', 'uuid', 'exists:users,id'],
        ]);

        $lead->update(['assigned_to' => $data['assigned_to']]);

        // Notify newly assigned staff
        $staff = User::find($data['assigned_to']);
        if ($staff) {
            $lead->load('property:id,title');
            $this->notificationService->send(
                $staff,
                'Inquiry assigned to you',
                "You've been assigned an inquiry for {$lead->property?->title}.",
                'inquiry_assigned',
                ['action_type' => 'inquiry', 'action_id' => $lead->id, 'action_url' => '/admin/inquiries'],
            );
        }

        return $this->successResponse(null, 'Inquiry reassigned.');
    }

    // ── Agent ──────────────────────────────────────────────

    public function agentInquiries(Request $request): JsonResponse
    {
        $user = $request->user();
        $agentProfile = $user->agentProfile;

        if (!$agentProfile) {
            return $this->errorResponse('Agent profile not found.', 403);
        }

        $paginator = Lead::where('agent_id', $agentProfile->id)
            ->whereNotNull('status')
            ->where('status', '!=', '')
            ->with('property:id,title,slug')
            ->select(['id', 'property_id', 'full_name', 'status', 'created_at'])
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        // Agent sees name + property only — NO phone/email
        $items = collect($paginator->items())->map(fn (Lead $lead) => [
            'id'        => $lead->id,
            'full_name' => $lead->full_name,
            'status'    => $lead->status,
            'property'  => $lead->property ? [
                'id'    => $lead->property->id,
                'title' => $lead->property->title,
                'slug'  => $lead->property->slug,
            ] : null,
            'created_at' => $lead->created_at?->toIso8601String(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Success',
            'data'    => $items,
            'meta'    => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ]);
    }
}
