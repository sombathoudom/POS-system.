<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Product;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Supplier;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
        Category::create([
            'category_name' => 'Category 1',
        ]);
        Supplier::create([
            'supplier_name' => 'Supplier 1',
            'contact_info' => 'Supplier 1 Contact Info',
        ]);
        Customer::create([
            'name' => 'WalkIn Customer',
            'phone' => 'N/A',
            'address' => 'N/A',
        ]);
        for ($i = 0; $i < 10; $i++) {
            Product::create([
                'product_name' => 'Product 1',
                'category_id' => 1,
                'type' => 'single',
                'product_code' => '1234567890' . $i,
                'cost_price_usd' => 100,
                'sell_price_usd' => 100,
                'cost_price_khr' => 100 * 4100,
                'sell_price_khr' => 100 * 4100,
                'quantity' => 100,
            ]);
        }
        $product = Product::create([
            'product_name' => 'Product 1',
            'category_id' => 1,
            'type' => 'variant',
            'product_code' => 'ww1234567890',
            'cost_price_usd' => 100,
            'sell_price_usd' => 100,
            'cost_price_khr' => 100 * 4100,
            'sell_price_khr' => 100 * 4100,
            'quantity' => 100,
        ]);
        $product->variants()->create([
            'variant_code' => 'ww1234567890-1',
            'cost_price_usd' => 100,
            'sell_price_usd' => 100,
            'cost_price_khr' => 100 * 4100,
            'sell_price_khr' => 100 * 4100,
            'quantity' => 100,
        ]);
    }
}
