<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $proposal->title }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            padding: 40px;
            color: #333;
        }
        
        /* Header with logo */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
        }
        
        .logo-container {
            text-align: right;
            max-width: 200px;
        }
        
        .logo {
            max-height: 80px;
            max-width: 200px;
            object-fit: contain;
        }
        
        .company-info {
            flex: 1;
            padding-right: 30px;
        }
        
        h1, h2, h3 { color: #333; }
        p { margin-bottom: 0.75rem; }

        .section {
            margin-bottom: 1.2rem;
        }

        /* ... rest of your existing styles ... */
    </style>
</head>
<body>
    <!-- Add header with logo -->
    <div class="header">
        <div class="company-info">
            <h1 style="margin: 0; color: #2c3e50; font-size: 24px;">
                {{ $proposal->your_company ?? $proposal->your_name }}
            </h1>

            @if($proposal->your_position)
                <p style="margin: 5px 0; color: #7f8c8d; font-size: 14px;">
                    {{ $proposal->your_position }}
                </p>
            @endif

            @if($proposal->your_contact_info)
                <p style="margin: 5px 0; color: #7f8c8d; font-size: 12px;">
                    {!! nl2br(e($proposal->your_contact_info)) !!}
                </p>
            @endif
        </div>

        @if($companyLogo)
        <div class="logo-container">
            <img src="{{ $companyLogo }}" alt="Company Logo" class="logo" />
        </div>
        @endif
    </div>

    <div class="content">
        {!! $filledContent !!}
    </div>

    @if($signatureImage)
        <div class="signature">
            <p>Signed by: {{ $proposal->signed_data['your_name'] ?? 'Unknown' }}</p>
            <img src="{{ $signatureImage }}" alt="Signature" />
        </div>
    @endif

    <div class="footer">
        Proposal generated on {{ now()->format('M d, Y') }}<br>
        Powered by <strong>G8Pitch</strong>
    </div>
</body>
</html>