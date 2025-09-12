<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        // Pivot table for users <-> organizations with role
        Schema::create('organization_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('subscription_type')->default('free');
            $table->string('subscription_status')->default('pending');
            $table->string('role')->default('member'); // owner, admin, member
            $table->timestamps();
            $table->unique(['organization_id', 'user_id']);
        });

        // Add organization_id to clients and proposals (nullable first)
        Schema::table('clients', function (Blueprint $table) {
            $table->foreignId('organization_id')->nullable()->constrained()->cascadeOnDelete();
        });

        Schema::table('proposals', function (Blueprint $table) {
            $table->foreignId('organization_id')->nullable()->constrained()->cascadeOnDelete();
        });
    }

    public function down()
    {
        Schema::dropIfExists('organization_user');
        Schema::dropIfExists('organizations');
    }
};
