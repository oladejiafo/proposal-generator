<?php
// app/Mail/SendProposalLink.php
namespace App\Mail;

use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SendProposalLink extends Mailable
{
    use Queueable, SerializesModels;

    public $proposal;

    public function __construct(Proposal $proposal)
    {
        $this->proposal = $proposal;
    }

    public function build()
    {
        // $link = url('/proposal/view/' . $this->proposal->secure_link_token);
        $link = url('/api/proposal/view/' . $this->proposal->secure_link_token);

        return $this->subject('Your Proposal is Ready')
                    ->view('emails.proposal_link')
                    ->with([
                        'proposalTitle' => $this->proposal->title,
                        'clientName' => $this->proposal->client->name ?? 'Client',
                        'link' => $link,
                    ]);
    }
}
