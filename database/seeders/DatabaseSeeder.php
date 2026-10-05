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
        foreach ([
            ['name' => 'general_doc', 'description' => 'Institutional documents'],
            ['name' => 'Links', 'description' => 'External links'],
        ] as $category) {
            \App\Models\Category::firstOrCreate(['name' => $category['name']], $category);
        }

        // Director account
        User::firstOrCreate(
            ['email' => 'director@cvsu.edu.ph'],
            [
                'name'        => 'CELLAR Director',
                'password'    => Hash::make('director123'),
                'is_director' => true,
                'is_critic'   => true,
                'status'      => 'active',
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'director@cellar.edu.ph'],
            [
                'name'        => 'CELLAR Director',
                'password'    => Hash::make('password'),
                'is_director' => true,
                'is_critic'   => true,
                'status'      => 'active',
                'email_verified_at' => now(),
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

        $critics = [
            ['name' => 'Critic Dummy 1', 'email' => 'critic1@cvsu.edu.ph', 'college' => 'CAS', 'status' => 'active'],
            ['name' => 'Critic Dummy 2', 'email' => 'critic2@cvsu.edu.ph', 'college' => 'CEIT', 'status' => 'active'],
            ['name' => 'Critic Dummy 3', 'email' => 'critic3@cvsu.edu.ph', 'college' => 'CAFENR', 'status' => 'active'],
            ['name' => 'Critic Dummy 4', 'email' => 'critic4@cvsu.edu.ph', 'college' => 'CEMDS', 'status' => 'active'],
            ['name' => 'Critic Dummy 5', 'email' => 'critic5@cvsu.edu.ph', 'college' => 'CON', 'status' => 'active'],
            ['name' => 'Critic Dummy 6', 'email' => 'critic6@cvsu.edu.ph', 'college' => 'CED', 'status' => 'pending'],
            ['name' => 'Critic Dummy 7', 'email' => 'critic7@cvsu.edu.ph', 'college' => 'CVMBS', 'status' => 'active'],
        ];

        foreach ($critics as $critic) {
            $user = User::firstOrNew(['email' => $critic['email']]);
            $user->fill([
                'name'       => $critic['name'],
                'college'    => $critic['college'],
                'is_critic'  => true,
                'status'     => $critic['status'],
            ]);

            if (! $user->exists) {
                $user->password = Hash::make('password');
                $user->email_verified_at = now();
            }

            $user->save();
        }
    }
}
