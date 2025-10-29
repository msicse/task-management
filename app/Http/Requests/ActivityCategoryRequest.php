<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ActivityCategoryRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255', 'unique:activity_categories,name,' . $this->activity_category?->id],
            'code' => ['nullable', 'string', 'max:50', 'unique:activity_categories,code,' . $this->activity_category?->id],
            'parent_id' => ['nullable', 'exists:activity_categories,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'standard_time' => ['nullable', 'integer', 'min:1', 'max:1440'], // 1 minute to 24 hours (1440 minutes)
            'definition' => ['nullable', 'string', 'max:1000'],
            'reference_protocol' => ['nullable', 'string', 'max:1000'],
            'objective' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The activity category name is required.',
            'name.unique' => 'This activity category name already exists.',
            'code.unique' => 'This activity category code already exists.',
            'parent_id.exists' => 'The selected parent category does not exist.',
            'department_id.exists' => 'The selected department does not exist.',
            'standard_time.integer' => 'The standard time must be a valid number.',
            'standard_time.min' => 'The standard time must be at least 1 minute.',
            'standard_time.max' => 'The standard time cannot exceed 1440 minutes (24 hours).',
            'definition.max' => 'The definition cannot exceed 1000 characters.',
            'reference_protocol.max' => 'The reference protocol cannot exceed 1000 characters.',
            'objective.max' => 'The objective cannot exceed 1000 characters.',
        ];
    }
}
