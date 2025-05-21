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
            $table->string('size')->nullable(); // Nullable for variants with no size
            $table->string('color')->nullable(); // Nullable for variants with no color
            $table->string('variant_code')->unique(); // Barcode for each variant
            $table->decimal('cost_price_usd', 8, 2); // Pricing for variants
            $table->decimal('sell_price_usd', 8, 2);
            $table->decimal('cost_price_khr', 10, 0);
            $table->decimal('sell_price_khr', 10, 0);
            $table->unique(['product_id', 'size', 'color']); // Ensure unique size/color per product
            $table->integer('quantity')->default(0);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['product_id', 'size', 'color']);
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
