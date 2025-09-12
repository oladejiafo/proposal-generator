<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $proposal->title }}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.5; }
        h2 { color: #333; }
        p { margin-bottom: 0.5rem; }
        .section { margin-bottom: 1.5rem; }
    </style>
</head>
<body>
    <h2>{{ $proposal->title }}</h2>

    <div class="section">
        <strong>Client:</strong> {{ $proposal->client->name ?? '' }} <br>
        <strong>Company:</strong> {{ $proposal->client->company ?? '' }}
    </div>

    <div class="section">
        <strong>Project Details:</strong><br>
        {!! nl2br(e($proposal->project_details)) !!}
    </div>

    <div class="section">
        <strong>Pricing:</strong> {{ $proposal->pricing }}
    </div>

    <div class="section">
        <strong>Your Name:</strong> {{ $proposal->your_name }} <br>
        <strong>Position:</strong> {{ $proposal->your_position }} <br>
        <strong>Contact Info:</strong> {{ $proposal->your_contact_info }}
    </div>

    <div class="section">
        <strong>Client Address:</strong> {{ $proposal->client_address }} <br>
        <strong>City/State/Zip:</strong> {{ $proposal->client_city_state_zip }}
    </div>

    @if($signatureImage)
        <hr>
        <p style="text-align:right;">Signed by: {{ $proposal->signed_data['your_name'] ?? 'Unknown' }}</p>
        <img src="{{ $signatureImage }}" alt="Signature" style="float:right; width:200px; height:auto;" />

    @endif

</body>
</html>
