<?php

use App\Models\User;
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
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class)->cascadeOnDelete();
            $table->string('file_path'); // Store the file path, not the actual file
            $table->string('file_name');
            $table->string('file_type'); // Store MIME type (e.g., image/png, application/pdf)
            $table->decimal('file_size', 10, 2); // Store file size in bytes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
