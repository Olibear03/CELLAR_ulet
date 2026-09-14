<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name'              => fake()->name(),
            'email'             => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password'          => static::$password ??= Hash::make('password'),
            'remember_token'    => Str::random(10),
            'is_director'       => false,
            'is_assistant'      => false,
            'is_staff'          => false,
            'is_critic'         => false,
            'status'            => 'active',
        ];
    }

    public function director(): static
    {
        return $this->state(['is_director' => true, 'status' => 'active']);
    }

    public function assistant(): static
    {
        return $this->state(['is_assistant' => true, 'status' => 'active']);
    }

    public function staff(): static
    {
        return $this->state(['is_staff' => true, 'status' => 'active']);
    }

    public function critic(): static
    {
        return $this->state(['is_critic' => true, 'status' => 'pending']);
    }

    public function unverified(): static
    {
        return $this->state(['email_verified_at' => null]);
    }
}
