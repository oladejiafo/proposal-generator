<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $proposal->title }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; padding: 40px; }
        h1, h2, h3 { margin-bottom: 10px; color: #111; }
        .section { margin-bottom: 30px; }
        .signature { margin-top: 50px; text-align: right; }
        .signature img { width: 180px; height: auto; margin-top: 10px; }
        .footer { margin-top: 50px; font-size: 12px; color: #888; text-align: center; }
        .pricing-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .pricing-table th, .pricing-table td { border: 1px solid #ddd; padding: 8px; }
        .pricing-table th { background: #f8f8f8; }
    </style>
    @stack('styles')
</head>
<body>
    <div class="container">
        @yield('content')

        @if($signatureImage)
            <div class="signature">
                <p>Signed by: {{ $proposal->signed_data['your_name'] ?? 'Unknown' }}</p>
                <img src="{{ $signatureImage }}" alt="Signature" />
            </div>
        @endif

        <div class="footer">
            Proposal generated on {{ now()->format('M d, Y') }}
        </div>
    </div>
</body>
</html>
