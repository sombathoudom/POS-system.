<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Product;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Supplier;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::create([
            'name' => 'admin',
            'email' => 'admin@gmail.com',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
            'password' => Hash::make('12345678'),
        ]);
        $category = [
            'Hawai Shirt',
            'Women Short Pants',
        ];
        foreach ($category as $c) {
            Category::create([
                'category_name' => $c,
            ]);
        }
        Supplier::create([
            'supplier_name' => 'Sinal Hawai',
            'contact_info' => 'ស្ទឹងមានជ័យ',
        ]);

        Customer::create([
            'name' => 'WalkIn Customer',
            'phone' => 'N/A',
            'address' => 'N/A',
        ]);

        $this->call([
            ExpenseSeeder::class,
        ]);

        // for ($i = 0; $i < 100; $i++) {
        //     Product::create([
        //         'product_name' => 'Product 1' . $i,
        //         'category_id' => rand(1, 5),
        //         'type' => 'single',
        //         'product_code' => '1234567890' . $i,
        //         'cost_price_usd' => 100,
        //         'sell_price_usd' => 100,
        //         'cost_price_khr' => 100 * 4100,
        //         'sell_price_khr' => 100 * 4100,
        //         'quantity' => 100,
        //     ]);
        // }
        // $product = Product::create([
        //     'product_name' => 'Product 1',
        //     'category_id' => 1,
        //     'type' => 'variant',
        //     'product_code' => 'ww1234567890',
        //     'cost_price_usd' => 100,
        //     'sell_price_usd' => 100,
        //     'cost_price_khr' => 100 * 4100,
        //     'sell_price_khr' => 100 * 4100,
        //     'quantity' => 100,
        // ]);
        // $product->variants()->create([
        //     'variant_code' => 'ww1234567890-1',
        //     'cost_price_usd' => 100,
        //     'sell_price_usd' => 100,
        //     'cost_price_khr' => 100 * 4100,
        //     'sell_price_khr' => 100 * 4100,
        //     'quantity' => 100,
        // ]);
    }
}
