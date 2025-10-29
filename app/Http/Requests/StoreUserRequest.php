<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
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
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'designation' => ['required', 'string', 'max:255'],
            'employee_id' => ['required', 'string', 'max:255', 'unique:users'],
            'phone' => ['required', 'string', 'max:20'],
            'blood' => ['required', 'string', 'max:10'],
            'gender' => ['required', 'in:male,female,other'],
            'location' => ['required', 'string', 'max:255'],
            'date_of_join' => ['required', 'date'],
            'date_of_resign' => ['nullable', 'date', 'after_or_equal:date_of_join'],
            'status' => ['required', 'in:active,inactive'],
            'about' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:1024'],
            'department_id' => ['required', 'exists:departments,id'],
            'role_ids' => ['required', 'array', 'min:1'],
            'role_ids.*' => ['required', 'exists:roles,id'],
            'work_role_ids' => ['nullable', 'array'],
            'work_role_ids.*' => ['exists:work_roles,id'],
        ];
    }
}
