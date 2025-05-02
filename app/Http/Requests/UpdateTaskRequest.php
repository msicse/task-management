<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            "image" => ["nullable", "image"],
            "name" => ["nullable", "max:255"],
            "description" => ["nullable", "string"],
            "due_date" => ["nullable", "date"],
            "status" => ["nullable", Rule::in(['pending', 'in_progress', 'completed'])],
            "priority" => ["nullable", Rule::in(['low', 'medium', 'high'])],
            "project_id" => ["nullable", 'exists:projects,id'],
            "assigned_user_id" => ["nullable", 'exists:users,id'],
            "completed_at" => ["nullable", "date"],
            "assignor_score" => ["nullable", "integer", "min:1", "max:5"],
            "assignee_score" => ["nullable", "integer", "min:1", "max:5"],
        ];
    }
}
