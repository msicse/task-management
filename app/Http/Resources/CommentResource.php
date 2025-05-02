<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'content' => $this->content,
            'created_at' => $this->created_at->format('Y-m-d'),
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'avatar' => null, // Add avatar handling here if needed
            ],
            'replies' => CommentResource::collection($this->whenLoaded('replies')),
            'parent_id' => $this->parent_id,
        ];
    }
}
