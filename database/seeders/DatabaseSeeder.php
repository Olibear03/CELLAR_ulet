<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Director account
        User::firstOrCreate(
            ['email' => 'director@cellar.edu.ph'],
            [
                'name'        => 'CELLAR Director',
                'password'    => Hash::make('password'),
                'is_director' => true,
                'status'      => 'active',
            ]
        );

        // Admin Assistant account
        User::firstOrCreate(
            ['email' => 'assistant@cellar.edu.ph'],
            [
                'name'         => 'Admin Assistant',
                'password'     => Hash::make('password'),
                'is_assistant' => true,
                'status'       => 'active',
            ]
        );
    }
}
