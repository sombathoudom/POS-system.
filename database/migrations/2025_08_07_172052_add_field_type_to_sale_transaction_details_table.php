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
        Schema::table('sale_transaction_details', function (Blueprint $table) {
            //
            $table->enum('type', ['sale', 'return'])->default('sale');
            $table->enum('calculation_type', ['decrease', 'increase'])->default('decrease');
            $table->string('calculation_value')->nullable();
            $table->date('sale_date')->nullable();
            $table->date('return_date')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sale_transaction_details', function (Blueprint $table) {
            //
        });
    }
};
