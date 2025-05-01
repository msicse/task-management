<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
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
            "image" => ["nullable", "image", "max:2048"], // 2MB max
            "name" => ["required", "string", "max:255"],
            "description" => ["nullable", "string"], // Allow HTML content
            "due_date" => ["nullable", "date"],
            "status" => ["required", Rule::in(['pending', 'in_progress', 'completed'])],
            "priority" => ["required", Rule::in(['low', 'medium', 'high'])],
            "factory_id" => ["nullable", "string", "max:255"],
            "category_id" => ["required", "exists:categories,id"],
            "assigned_user_id" => ["required", "exists:users,id"],
        ];
    }
}
