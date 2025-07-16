<?php

use Carbon\Carbon;

if (!function_exists('format_date')) {
    function format_date($date, $format = 'd/m/Y')
    {
        return Carbon::parse($date)->format($format);
    }
}

if (!function_exists('format_currency')) {
    function format_currency($amount, $currency = 'USD')
    {
        if ($currency === 'KHR') {
            return number_format($amount, 0) . '៛';
        }
        return '$' . number_format($amount, 2);
    }
}
