<?php
// app/Jobs/SendProposalEmail.php
namespace App\Jobs;

use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use App\Mail\SendProposalLink;

class SendProposalEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $proposal;

    public function __construct(Proposal $proposal)
    {
        $this->proposal = $proposal;
    }

    public function handle()
    {
        $link = url("/proposal/view/{$this->proposal->secure_link_token}");
        Mail::to($this->proposal->client->email)
            ->send(new SendProposalLink($this->proposal, $link));

        $this->proposal->update(['status' => 'sent']);
    }
}
