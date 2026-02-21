<?php

namespace App\Services;

use App\Enums\VerificationStatus;
use App\Models\AgentProfile;
use App\Models\Lead;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class AgentService
{
    public function __construct(
        protected ImageService $imageService,
    ) {}

    public function updateProfile(AgentProfile $agent, array $data): AgentProfile
    {
        $agent->update($data);

        return $agent->fresh();
    }

    public function submitVerification(AgentProfile $agent, array $data, array $files): AgentProfile
    {
        return DB::transaction(function () use ($agent, $data, $files) {
            $updateData = [
                'id_document_type'   => $data['id_document_type'],
                'id_document_number' => $data['id_document_number'],
                'verification_status' => VerificationStatus::Pending,
            ];

            if (isset($files['id_document_front'])) {
                $result = $this->imageService->uploadPrivate($files['id_document_front']);
                $updateData['id_document_front_url'] = $result['url'];
                $updateData['id_document_front_public_id'] = $result['public_id'];
            }

            if (isset($files['id_document_back'])) {
                $result = $this->imageService->uploadPrivate($files['id_document_back']);
                $updateData['id_document_back_url'] = $result['url'];
                $updateData['id_document_back_public_id'] = $result['public_id'];
            }

            if (isset($files['selfie'])) {
                $result = $this->imageService->uploadPrivate($files['selfie']);
                $updateData['selfie_url'] = $result['url'];
                $updateData['selfie_public_id'] = $result['public_id'];
            }

            if (isset($files['cac_document'])) {
                $result = $this->imageService->uploadPrivate($files['cac_document']);
                $updateData['cac_document_url'] = $result['url'];
                $updateData['cac_document_public_id'] = $result['public_id'];
            }

            $agent->update($updateData);

            return $agent->fresh();
        });
    }

    public function getVerificationDocumentUrls(AgentProfile $agent): array
    {
        $docs = [];

        $fields = [
            'id_document_front' => 'id_document_front_public_id',
            'id_document_back'  => 'id_document_back_public_id',
            'selfie'            => 'selfie_public_id',
            'cac_document'      => 'cac_document_public_id',
        ];

        foreach ($fields as $name => $publicIdField) {
            $publicId = $agent->{$publicIdField};
            $docs[$name] = $publicId
                ? $this->imageService->getSignedUrl($publicId)
                : null;
        }

        return $docs;
    }

    public function getLeads(AgentProfile $agent, int $perPage = 15): LengthAwarePaginator
    {
        return Lead::where('agent_id', $agent->id)
            ->with(['property:id,title,slug', 'property.images' => fn ($q) => $q->where('is_cover', true), 'user:id,first_name,last_name,phone'])
            ->latest('created_at')
            ->paginate($perPage);
    }

    public function recalculateResponseMetrics(AgentProfile $agent): void
    {
        $totalLeads = Lead::where('agent_id', $agent->id)->count();
        $respondedLeads = Lead::where('agent_id', $agent->id)->responded()->count();

        $responseRate = $totalLeads > 0
            ? round(($respondedLeads / $totalLeads) * 100, 1)
            : 0;

        $avgResponseTime = Lead::where('agent_id', $agent->id)
            ->responded()
            ->whereNotNull('response_time_min')
            ->avg('response_time_min');

        $agent->update([
            'response_rate'     => $responseRate,
            'avg_response_time' => $avgResponseTime ? (int) round($avgResponseTime) : null,
        ]);
    }

    public function getDashboardStats(AgentProfile $agent): array
    {
        return [
            'total_properties'   => $agent->properties()->count(),
            'active_properties'  => $agent->properties()->approved()->count(),
            'pending_properties' => $agent->properties()->pending()->count(),
            'total_leads'        => $agent->leads()->count(),
            'unresponded_leads'  => $agent->leads()->whereNull('responded_at')->count(),
            'total_views'        => $agent->properties()
                ->withCount('views')
                ->get()
                ->sum('views_count'),
            'avg_rating'         => $agent->avg_rating,
            'total_reviews'      => $agent->total_reviews,
            'verification_status' => $agent->verification_status,
            'subscription_tier'  => $agent->subscription_tier,
        ];
    }
}
