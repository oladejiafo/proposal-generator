<?php

return [
    'paths' => ['api/*', 'sanctum/*', 'login', 'logout', 'payments/*', 'organization/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // 'allowed_origins' => ['http://localhost:5173', 'http://127.0.0.1:5173'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://local.test:5173',
        'http://localhost:8000',
        'http://local.test:8000'
    ],
    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];




