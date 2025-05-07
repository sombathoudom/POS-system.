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
        Schema::create('inventory', function (Blueprint $table) {
            $table->id('inventory_id');
            $table->foreignId('variant_id')->constrained('product_variants', 'variant_id')->onDelete('cascade');
            $table->foreignId('supplier_id')->constrained('suppliers', 'supplier_id')->onDelete('cascade');
            $table->integer('quantity');
            $table->dateTime('purchase_date'); // For FIFO
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory');
    }
};
