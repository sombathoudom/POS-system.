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
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id(); // Auto-incrementing primary key
            $table->foreignId('purchase_order_id')->constrained()->onDelete('cascade'); // Foreign key to purchase_orders
            $table->foreignId('product_id')->constrained()->onDelete('restrict'); // Foreign key to products table
            $table->foreignId('variant_id')->nullable()->constrained()->onDelete('restrict'); // Foreign key to variants table
            $table->integer('quantity')->unsigned(); // Quantity of the item
            $table->decimal('unit_price', 10, 2); // Price per unit
            $table->decimal('subtotal', 10, 2)->default(0.00); // Quantity * unit_price
            $table->text('notes')->nullable(); // Optional notes for the item
            $table->timestamps(); // Created_at and updated_at columns
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
    }
};
