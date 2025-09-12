{{-- resources/views/secure-view.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $proposal->title }}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            background-color: #f8f9fa;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding-top: 20px;
            padding-bottom: 50px;
        }
        .proposal-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            padding: 30px;
            margin-bottom: 30px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eaeaea;
        }
        .company-logo {
            width: 120px;
            height: 120px;
            background: linear-gradient(135deg, #6c5ce7, #a29bfe);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            color: white;
            font-size: 40px;
        }
        .signature-pad {
            border: 2px dashed #dee2e6;
            border-radius: 8px;
            margin-bottom: 15px;
            background: #f8f9fa;
            cursor: crosshair;
        }
        .signature-actions {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        .status-badge {
            position: absolute;
            top: 20px;
            right: 20px;
        }
        .acceptance-section {
            background: #f1f8e9;
            padding: 25px;
            border-radius: 10px;
            margin-top: 30px;
        }
        .signature-preview {
            max-width: 300px;
            max-height: 100px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-top: 15px;
            display: none;
        }
        .proposal-content {
            line-height: 1.8;
        }
        .proposal-content h1 {
            color: #4a4a4a;
            margin-bottom: 20px;
        }
        .proposal-content h2 {
            color: #5c6bc0;
            margin-top: 30px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e8eaf6;
        }
        .proposal-content p {
            margin-bottom: 15px;
            color: #555;
        }
        .proposal-content ol {
            padding-left: 20px;
        }
        .proposal-content li {
            margin-bottom: 10px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eaeaea;
            color: #6c757d;
        }
        .loading-spinner {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
        }
        .error-alert {
            margin: 20px 0;
        }
        .debug-info {
            font-size: 12px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
        .api-status {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
        }
        .api-status i {
            margin-right: 8px;
        }
        .retry-button {
            margin-top: 10px;
        }
        

        p {
            margin: 0.25rem 0;
        }

        .section {
            margin-bottom: 1.2rem;
        }

        /* Markdown content container */
        .content {
            margin-bottom: 1.5rem;
        }

        /* Lists (bullets & numbers) */
        .content ul, .content ol {
            margin: 0.25rem 0 0.25rem 1.5rem;
            padding-left: 1.5rem;
        }

        .content li {
            margin-bottom: 0.25rem;
            line-height: 1.3;
            text-indent: -0.25rem;
            display: list-item;
            list-style-position: outside;
        }

        .proposal-content {
            line-height: 1.3; /* tighten line spacing */
        }

        .proposal-content ol,
        .proposal-content ul {
            margin-left: 1.5rem;
            padding-left: 1.2rem;
        }

        .proposal-content li {
            margin-bottom: 0.5rem;
            line-height: 1.5; /* match paragraph spacing */
            text-indent: 0;   /* remove negative indent */
        }

        .proposal-content ol li {
            list-style-position: inside; /* numbers inline with text */
        }

    </style>
</head>


@php
    $status = $proposal->status;

    // Map statuses to badge classes
    $statusClasses = [
        'draft' => 'bg-secondary',
        'sent' => 'bg-primary',
        'viewed' => 'bg-info',
        'accepted' => 'bg-success',
        'rejected' => 'bg-danger',
    ];

    $badgeClass = $statusClasses[$status] ?? 'bg-dark';
@endphp

<body>

    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-10">
                <div class="proposal-container position-relative">

                    <span id="status-badge" class="status-badge badge {{ $badgeClass }}">
                        {{ strtoupper($status) }}
                    </span>
                    <div class="header">
                        @if($companyLogo)
                            <div class="company-logo mb-3">
                                <img src="{{ $companyLogo }}" alt="Company Logo" style="max-height:120px;">
                            </div>
                        @else
                            <div class="company-logo">
                                <i class="fas fa-file-contract"></i>
                            </div>
                        @endif

                        <h1 id="proposal-title">{{ $proposal->title ?? 'A Proposal' }}</h1>
                        <p> From {{ $proposal->your_company ?? $proposal->your_name }}</p>
                        <p class="lead">For your review and acceptance</p>
                    </div>
                    
                    <div class="proposal-content border p-3 mb-3">
                        <!-- {!! nl2br($preparedContent) !!} -->
                        {!! $preparedContent !!}
                    </div>
                    @if($signatureImage)
                        <div class="signature d-flex flex-column align-items-end" style="margin-top:5px;">
                            <p style="margin-bottom:2px; font-weight:500;">Signed by: {{ $proposal->signed_data['your_name'] ?? 'Unknown' }}</p>
                            <img src="{{ $signatureImage }}" 
                                alt="Signature" 
                                style="max-width:200px; max-height:60px; display:block; margin-top:2px;" />
                        </div>
                    @endif

                    @if(!$proposal->accepted_at)
                        <button id="accept-btn" class="btn btn-success btn-accept">Accept Proposal</button>
                        <br><small>To accept this proposal, please click the Accept button.</small>
                    @else
                        <div class="alert alert-success">Thank you! Proposal accepted.</div>
                    @endif

                </div>
            </div>
        </div>
        <div class="footer">
        Proposal generated on {{ now()->format('M d, Y') }}<br>
        Powered by <strong>G8Pitch</strong>
    </div>
    </div>

    <script>
        const proposalId = "{{ $proposal->id }}";
        const token = "{{ $proposal->view_token }}";

        // MARK AS VIEWED ON PAGE LOAD
        (async () => {
            try {
                await fetch('/api/proposals/viewed', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ token })
                });
                console.log('Proposal marked as viewed');
            } catch (err) {
                console.error('Failed to mark proposal as viewed', err);
            }
        })();

        // ACCEPT PROPOSAL BUTTON HANDLER
        const acceptBtn = document.getElementById('accept-btn');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', async () => {
                try {
                    const res = await fetch(`/api/proposals/accept`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        body: JSON.stringify({ token })
                    });

                    if (!res.ok) throw new Error('Failed to accept proposal');

                    alert('Proposal accepted!');
                    acceptBtn.style.display = 'none';
                    const msg = document.createElement('div');
                    msg.className = 'alert alert-success mt-3';
                    msg.textContent = 'Thank you! Proposal accepted.';
                    acceptBtn.parentNode.appendChild(msg);

                } catch (err) {
                    alert(err.message);
                    console.error(err);
                }
            });
        }
    </script>
</body>
</html>
