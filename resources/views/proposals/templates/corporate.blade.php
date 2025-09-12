@extends('proposals.layouts.base')

@section('content')
    <h1>{{ $proposal->title }}</h1>

    <div class="section">
        <strong>Client:</strong> {{ $proposal->client->name ?? '' }} <br>
        <strong>Company:</strong> {{ $proposal->client->company ?? '' }}
    </div>

    <div class="section">
        <h2>Project Overview</h2>
        <p>{!! nl2br(e($proposal->project_details)) !!}</p>
    </div>

    <div class="section">
        <h2>Pricing</h2>
        <table class="pricing-table">
            <tr><th>Item</th><th>Cost</th></tr>
            <tr><td>Main Project</td><td>{{ $proposal->pricing }}</td></tr>
        </table>
    </div>

    <div class="section">
        <h2>Prepared By</h2>
        <p>
            {{ $proposal->your_name }} <br>
            {{ $proposal->your_position }} <br>
            {{ $proposal->your_contact_info }}
        </p>
    </div>

    <div class="section">
        <h2>Client Address</h2>
        <p>
            {{ $proposal->client_address }} <br>
            {{ $proposal->client_city_state_zip }}
        </p>
    </div>

    <div class="signature">
        <hr style="margin-bottom:10px;">
        <p>Signed by: {{ $proposal->signed_data['your_name'] ?? 'Unknown' }}</p>
        <img src="{{ $signatureImage }}" alt="Signature" />
    </div>

@endsection
