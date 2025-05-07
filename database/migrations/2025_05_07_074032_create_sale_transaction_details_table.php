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
        Schema::create('sale_transaction_details', function (Blueprint $table) {
            $table->id('detail_id');
            $table->foreignId('transaction_id')->constrained('transactions', 'transaction_id')->onDelete('cascade');
            $table->foreignId('variant_id')->constrained('product_variants', 'variant_id')->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('unit_price_usd', 8, 2);
            $table->decimal('unit_price_khr', 10, 0);
            $table->decimal('discount_amount_usd', 8, 2)->default(0);
            $table->decimal('discount_amount_khr', 10, 0)->default(0);
            $table->timestamps();
        });
        Schema::table('sale_transaction_details', function (Blueprint $table) {
            $table->index('variant_id', 'idx_transaction_details_variant');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_transaction_details');
    }
};
