<?php
namespace App\Enums;

enum Role: string {
    case OWNER = 'owner';
    case ADMIN = 'admin';
    case MEMBER = 'member';
    case GUEST = 'guest';
}
