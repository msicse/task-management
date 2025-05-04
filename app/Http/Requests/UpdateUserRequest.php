<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($this->user)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'designation' => ['nullable', 'string', 'max:255'],
            'employee_id' => ['nullable', 'string', 'max:255', Rule::unique('users')->ignore($this->user)],
            'phone' => ['nullable', 'string', 'max:20'],
            'blood' => ['nullable', 'string', 'max:10'],
            'gender' => ['nullable', 'in:male,female,other'],
            'location' => ['nullable', 'string', 'max:255'],
            'date_of_join' => ['nullable', 'date'],
            'date_of_resign' => ['nullable', 'date', 'after_or_equal:date_of_join'],
            'status' => ['required', 'in:active,inactive'],
            'about' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:1024'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'role_id' => ['required', 'exists:roles,name'],
        ];
    }
}
