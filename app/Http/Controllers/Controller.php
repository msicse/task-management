<?php

namespace App\Http\Controllers;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

abstract class Controller extends BaseController
{
    use AuthorizesRequests;

    // Note: AuthorizesResources trait was removed in Laravel 8+, if you need resource auto-authorization,
    // consider registering policies and using $this->authorize() in controllers.
}
