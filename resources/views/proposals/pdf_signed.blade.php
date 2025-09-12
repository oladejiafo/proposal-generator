<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Proposal #{{ $proposal->id }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 30px;
            font-size: 14px;
            color: #333;
        }
        h1, h2, h3 {
            margin-bottom: 10px;
        }
        p {
            line-height: 1.5;
            margin-bottom: 15px;
        }
        .signature {
            margin-top: 40px;
            border-top: 1px solid #ccc;
            padding-top: 10px;
            max-width: 300px;
        }
        .signature img {
            width: 200px;
            height: auto;
        }
        @media print {
            .page-break { page-break-after: always; }
        }
    </style>
</head>
<body>
    <h1>Proposal #{{ $proposal->id }}</h1>
    <h2>{{ $proposal->title ?? 'Untitled' }}</h2>

    <div>
        {!! $proposal->content !!}
    </div>

    @if ($signatureBase64 && $signatureMimeType)
        <div class="signature">
            <p>Signed by: {{ $signerName }}</p>
            <img src="data:{{ $signatureMimeType }};base64,{{ $signatureBase64 }}" alt="Signature" />
            <p>Signed at: {{ $proposal->signed_data['signed_at'] ?? '' }}</p>
        </div>
    @endif
</body>
</html>