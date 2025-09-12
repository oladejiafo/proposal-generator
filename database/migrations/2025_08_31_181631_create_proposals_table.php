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
        Schema::create('proposals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            // $table->foreignId('proposal_template_id')->constrained()->onDelete('set null')->nullable();
            $table->foreignId('proposal_template_id')
            ->nullable() // required for SET NULL
            ->constrained('proposal_templates')
            ->nullOnDelete(); // shorthand for ON DELETE SET NULL      
            $table->string('title');
            $table->string('status')->default('draft'); // draft, sent, viewed, approved, declined
            $table->string('secure_link_token')->unique(); // random token for secure client link

            $table->longText('project_details')->nullable();
            $table->string('pricing')->nullable();
            $table->string('your_name')->nullable();
            $table->string('your_position')->nullable();
            $table->string('your_contact_info')->nullable();
            $table->string('client_address')->nullable();
            $table->string('client_city_state_zip')->nullable();
            $table->longText('content')->nullable(); 

            $table->text('signature')->nullable(); // base64 image string for e-signature
            $table->json('signed_data')->nullable();
            $table->string('signed_ip')->nullable();
            $table->string('signed_user_agent')->nullable();
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposals');
    }
};
