<?php

namespace Database\Seeders;

use App\Models\ExpenseCategory;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ExpenseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ExpenseCategory::create([
            'name' => 'Salary',
        ]);
        ExpenseCategory::create([
            'name' => 'Boost Page',
        ]);
        ExpenseCategory::create([
            'name' => 'Delivery',
        ]);
        ExpenseCategory::create([
            'name' => 'Package (ថង់)',
        ]);
        ExpenseCategory::create([
            'name' => 'Markers (សម្រាប់សរេសរ)',
        ]);
        ExpenseCategory::create([
            'name' => 'Other',
        ]);
    }
}
