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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id(); // Auto-incrementing primary key
            $table->foreignId('supplier_id')->constrained('suppliers', 'supplier_id')->onDelete('restrict'); // Foreign key to suppliers table
            $table->date('order_date'); // Date of the purchase order
            $table->decimal('total_amount', 10, 2)->default(0.00); // Total amount of the purchase order
            $table->enum('status', ['pending', 'paid'])->default('pending'); // Order status
            $table->text('notes')->nullable(); // Optional notes for the purchase order
            $table->timestamps(); // Created_at and updated_at columns
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
