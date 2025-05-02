<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProjectResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */

     public static $wrap = false;
    public function toArray(Request $request): array
    {
        return [
            "id"=> $this->id,
            "name"=> $this->name,
            "description"=> $this->description,
            "created_at"=> (new Carbon($this->created_at))->format("d-m-Y"),
            "due_date"=> $this->due_date ? (new Carbon($this->due_date))->format("d-m-Y") : null,
            "status"=> $this->status,
            "image_path"=> $this->image_path ? Storage::url($this->image_path) : $this->image_path,
            "createdBy"=> new UserResource($this->createdBy),
            "updatedBy"=> new UserResource($this->updatedBy),
        ];
    }
}
