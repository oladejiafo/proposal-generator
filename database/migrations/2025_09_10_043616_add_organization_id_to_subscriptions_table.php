<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // Add organization_id column
            $table->foreignId('organization_id')->after('user_id')->nullable();
            
            // Add foreign key constraint
            $table->foreign('organization_id')
                  ->references('id')
                  ->on('organizations')
                  ->onDelete('cascade');
        });
    }
    
    public function down()
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // Drop foreign key first
            $table->dropForeign(['organization_id']);
            
            // Then drop the column
            $table->dropColumn('organization_id');
        });
    }
};
