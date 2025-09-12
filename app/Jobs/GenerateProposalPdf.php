<?php
// app/Jobs/GenerateProposalPdf.php
namespace App\Jobs;

use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
// use PDF; // dompdf wrapper if you're using barryvdh/laravel-dompdf
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class GenerateProposalPdf implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $proposal;

    public function __construct(Proposal $proposal)
    {
        $this->proposal = $proposal;
    }

    public function handle()
    {
        $pdf = PDF::loadView('pdfs.proposal', ['proposal' => $this->proposal]);

        $path = "proposals/{$this->proposal->id}.pdf";
        Storage::disk('public')->put($path, $pdf->output());

        // Optional: save PDF path on proposal
        $this->proposal->update(['pdf_path' => $path]);
    }
}
