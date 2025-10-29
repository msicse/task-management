<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreActivityRequest extends FormRequest
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
            'activity_category_id' => 'required|exists:activity_categories,id',
            'description' => 'nullable|string|max:1000',
            'status' => 'required|in:started,paused,completed',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'activity_category_id.required' => 'Please select an activity category.',
            'activity_category_id.exists' => 'The selected activity category is invalid.',
            'status.in' => 'The status must be one of: started, paused, or completed.',
        ];
    }
}
