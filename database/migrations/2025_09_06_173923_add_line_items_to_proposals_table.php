<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // In the migration file
    public function up()
    {
        Schema::table('proposals', function (Blueprint $table) {
            $table->json('line_items')->nullable()->after('pricing');
        });
    }

    public function down()
    {
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropColumn('line_items');
        });
    }
};
