<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('predefined_proposals', function (Blueprint $table) {
            $table->foreignId('organization_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            // $table->boolean('is_public')->default(false);
            $table->boolean('is_premium')->default(false);
        });
    }
    
    public function down()
    {
        Schema::table('predefined_proposals', function (Blueprint $table) {
            $table->dropColumn(['organization_id','user_id','is_public','is_premium']);
        });
    }
    
};
