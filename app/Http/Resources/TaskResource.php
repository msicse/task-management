<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class TaskResource extends JsonResource
{
    public static $wrap = false;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "name" => $this->name,
            "description" => $this->description,
            "created_at" => (new Carbon($this->created_at))->format("d-m-Y"),
            "due_date" => $this->due_date ? (new Carbon($this->due_date))->format("d-m-Y") : null,
            "completed_at" => $this->completed_at ? (new Carbon($this->completed_at))->format("d-m-Y") : null,
            "approved_at" => $this->approved_at ? (new Carbon($this->approved_at))->format("d-m-Y") : null,
            "status" => $this->status,
            "priority" => $this->priority,
            "time_log" => $this->time_log,
            "factory_id" => $this->factory_id,
            "category_id" => $this->category_id,
            "assigned_user_id" => $this->assigned_user_id,
            "creator_rating" => $this->creator_rating,
            "assignee_rating" => $this->assignee_rating,
            "image_path" => $this->image_path ? Storage::url($this->image_path) : $this->image_path,
            "category" => $this->category ? ["id" => $this->category->id, "name" => $this->category->name] : null,
            "assignedUser" => $this->assignedUser ? new UserResource($this->assignedUser) : null,
            "createdBy" => new UserResource($this->createdBy),
            "updatedBy" => new UserResource($this->updatedBy),
        ];
    }
}
