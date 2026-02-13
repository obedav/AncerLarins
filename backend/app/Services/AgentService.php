<?php

namespace App\Services;

use App\Enums\VerificationStatus;
use App\Models\AgentProfile;
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
                $result = $this->imageService->upload($files['id_document_front'], 'verification');
                $updateData['id_document_front_url'] = $result['url'];
            }

            if (isset($files['id_document_back'])) {
                $result = $this->imageService->upload($files['id_document_back'], 'verification');
                $updateData['id_document_back_url'] = $result['url'];
            }

            if (isset($files['selfie'])) {
                $result = $this->imageService->upload($files['selfie'], 'verification');
                $updateData['selfie_url'] = $result['url'];
            }

            if (isset($files['cac_document'])) {
                $result = $this->imageService->upload($files['cac_document'], 'verification');
                $updateData['cac_document_url'] = $result['url'];
            }

            $agent->update($updateData);

            return $agent->fresh();
        });
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
