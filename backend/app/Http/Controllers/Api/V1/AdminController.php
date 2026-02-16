<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ApprovePropertyRequest;
use App\Http\Requests\Admin\BanUserRequest;
use App\Http\Requests\Admin\RejectAgentRequest;
use App\Http\Requests\Admin\RejectPropertyRequest;
use App\Http\Requests\Admin\VerifyAgentRequest;
use App\Http\Resources\AdminPropertyResource;
use App\Http\Resources\AgentListResource;
use App\Http\Resources\DashboardStatsResource;
use App\Http\Resources\PropertyListResource;
use App\Models\AgentProfile;
use App\Models\Property;
use App\Models\Report;
use App\Models\User;
use App\Services\AdminService;
use App\Services\ReportService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    use ApiResponse;

    public function __construct(
        protected AdminService $adminService,
        protected ReportService $reportService,
    ) {}

    public function dashboard(): JsonResponse
    {
        $stats = $this->adminService->getDashboardStats();

        return $this->successResponse(new DashboardStatsResource($stats));
    }

    public function pendingProperties(Request $request): JsonResponse
    {
        $properties = Property::pending()
            ->with(['propertyType', 'city', 'area', 'agent.user', 'images'])
            ->withCount('reports')
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return $this->paginatedResponse(
            $properties->setCollection(
                $properties->getCollection()->map(fn ($p) => new AdminPropertyResource($p))
            )
        );
    }

    public function approveProperty(ApprovePropertyRequest $request): JsonResponse
    {
        $property = Property::findOrFail($request->property_id);
        $property = $this->adminService->approveProperty($property, $request->user());

        return $this->successResponse(
            new AdminPropertyResource($property->load(['propertyType', 'city', 'agent.user'])),
            'Property approved.'
        );
    }

    public function rejectProperty(RejectPropertyRequest $request): JsonResponse
    {
        $property = Property::findOrFail($request->property_id);
        $property = $this->adminService->rejectProperty($property, $request->rejection_reason, $request->user());

        return $this->successResponse(
            new AdminPropertyResource($property->load(['propertyType', 'city', 'agent.user'])),
            'Property rejected.'
        );
    }

    public function featureProperty(Request $request): JsonResponse
    {
        $request->validate([
            'property_id' => 'required|uuid|exists:properties,id',
            'days'         => 'nullable|integer|min:1|max:365',
        ]);

        $property = Property::findOrFail($request->property_id);
        $property = $this->adminService->featureProperty($property, $request->integer('days', 30));

        return $this->successResponse(null, 'Property featured.');
    }

    public function pendingAgents(Request $request): JsonResponse
    {
        $agents = AgentProfile::pending()
            ->with('user')
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return $this->paginatedResponse(
            $agents->setCollection(
                $agents->getCollection()->map(fn ($a) => new AgentListResource($a))
            )
        );
    }

    public function verifyAgent(VerifyAgentRequest $request): JsonResponse
    {
        $agent = AgentProfile::findOrFail($request->agent_profile_id);
        $this->adminService->verifyAgent($agent, $request->user());

        return $this->successResponse(null, 'Agent verified.');
    }

    public function rejectAgent(RejectAgentRequest $request): JsonResponse
    {
        $agent = AgentProfile::findOrFail($request->agent_profile_id);
        $this->adminService->rejectAgent($agent, $request->rejection_reason, $request->user());

        return $this->successResponse(null, 'Agent verification rejected.');
    }

    public function banUser(BanUserRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::findOrFail($data['user_id']);
        $this->adminService->banUser($user, $data['ban_reason'], $request->user());

        return $this->successResponse(null, 'User banned.');
    }

    public function reports(Request $request): JsonResponse
    {
        $reports = Report::with(['reporter', 'reportable', 'resolvedByUser'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->latest('created_at')
            ->paginate($request->integer('per_page', 20));

        return $this->paginatedResponse($reports);
    }

    public function resolveReport(Request $request, Report $report): JsonResponse
    {
        $request->validate(['resolution_note' => 'nullable|string|max:1000']);

        $this->reportService->resolve($report, $request->user(), $request->resolution_note);

        return $this->successResponse(null, 'Report resolved.');
    }
}
