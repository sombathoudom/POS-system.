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
        Schema::create('sale_transactions', function (Blueprint $table) {
            $table->id('transaction_id');
            $table->foreignId('customer_id')->constrained('customers', 'customer_id')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users', 'id')->onDelete('cascade');
            $table->foreignId('discount_id')->nullable()->constrained('discounts', 'discount_id')->onDelete('set null');
            $table->enum('currency', ['USD', 'KHR']);
            $table->decimal('total_amount_usd', 8, 2);
            $table->decimal('total_amount_khr', 10, 0);
            $table->dateTime('transaction_date');
            $table->timestamps();
        });
        Schema::table('sale_transactions', function (Blueprint $table) {
            $table->index('transaction_date', 'idx_transactions_date');
            $table->index('user_id', 'idx_transactions_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_transactions');
    }
};
