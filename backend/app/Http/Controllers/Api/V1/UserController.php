<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Services\CloudinaryService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponse;

    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'         => 'sometimes|string|max:255',
            'phone'        => 'sometimes|string|unique:users,phone,' . $request->user()->id,
            'bio'          => 'nullable|string|max:500',
            'company_name' => 'nullable|string|max:255',
            'lga'          => 'nullable|string',
            'state'        => 'nullable|string',
        ]);

        $request->user()->update($data);

        return $this->successResponse(new UserResource($request->user()->fresh()), 'Profile updated');
    }

    public function uploadAvatar(Request $request, CloudinaryService $cloudinary): JsonResponse
    {
        $request->validate(['avatar' => 'required|image|max:2048']);

        $result = $cloudinary->uploadImage($request->file('avatar'), 'avatars');

        if ($result['url']) {
            $request->user()->update(['avatar_url' => $result['url']]);
            return $this->successResponse(['avatar_url' => $result['url']], 'Avatar uploaded');
        }

        return $this->errorResponse('Upload failed', 500);
    }
}
