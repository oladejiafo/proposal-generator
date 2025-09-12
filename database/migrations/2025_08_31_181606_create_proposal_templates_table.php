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
        Schema::create('proposal_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedBigInteger('user_id')->nullable()->after('id'); // nullable for public templates
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->text('content'); // Blade/HTML with placeholders like {{client_name}}, {{project_description}}
            $table->boolean('is_public')->default(false); // For future marketplace
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposal_templates');
    }
};
