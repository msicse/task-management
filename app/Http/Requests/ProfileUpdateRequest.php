<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($this->user()->id)],
            'designation' => ['nullable', 'string', 'max:255'],
            'employee_id' => ['nullable', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:20'],
            'blood' => ['nullable', 'string', 'max:5'],
            'gender' => ['nullable', 'string', 'in:male,female,other'],
            'location' => ['nullable', 'string', 'max:255'],
            'about' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
