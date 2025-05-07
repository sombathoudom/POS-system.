<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id('variant_id');
            $table->foreignId('product_id')->constrained('products', 'product_id')->onDelete('cascade');
            $table->string('size')->nullable(); // Nullable for products with no size
            $table->string('color')->nullable(); // Nullable for products with no color
            $table->string('barcode')->unique()->nullable();
            $table->decimal('cost_price_usd', 8, 2);
            $table->decimal('sell_price_usd', 8, 2);
            $table->decimal('cost_price_khr', 10, 0); // KHR uses whole numbers
            $table->decimal('sell_price_khr', 10, 0);
            $table->unique(['product_id', 'size', 'color']);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
