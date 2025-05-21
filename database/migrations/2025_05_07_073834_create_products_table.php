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
            Schema::create('products', function (Blueprint $table) {
                $table->id('product_id');
                $table->string('product_name');
                $table->foreignId('category_id')->constrained('categories', 'category_id')->onDelete('cascade');
                $table->enum('type', ['single', 'variant'])->default('single'); //  // Product type
                $table->string('size')->nullable(); // Nullable for variants with no size
                $table->string('color')->nullable();
                $table->string('product_code')->unique(); // For single products
                $table->decimal('cost_price_usd', 8, 2)->nullable(); // For single products
                $table->decimal('sell_price_usd', 8, 2)->nullable(); // For single products
                $table->decimal('cost_price_khr', 10, 0)->nullable(); // For single products
                $table->decimal('sell_price_khr', 10, 0)->nullable(); // For single products
                $table->integer('quantity')->default(0);
                $table->timestamps();
                $table->softDeletes();
            });
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('products');
        }
    };
