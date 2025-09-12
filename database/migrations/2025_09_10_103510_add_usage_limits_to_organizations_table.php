<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // Migration
    public function up()
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->integer('monthly_proposal_limit')->default(7)->after('subscription_status');
            $table->integer('proposals_used_this_month')->default(0)->after('monthly_proposal_limit');
            $table->dateTime('usage_reset_at')->nullable()->after('proposals_used_this_month');
            $table->integer('templates_limit')->default(3)->after('usage_reset_at');

            $table->integer('templates_used')->default(0)->after('templates_limit');
            $table->integer('clients_limit')->default(10)->after('templates_used');
            $table->integer('clients_used')->default(0)->after('clients_limit');
    
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            //
        });
    }
};
