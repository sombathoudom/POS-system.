<?php

namespace App\Utils;


class Helpers
{
    /**
     * Format a date string to a specific format
     *
     * @param string $date
     * @return string
     */
    public static function formatDate($date)
    {
        return date('d/m/Y', strtotime($date));
    }

    /**
     * Format a price to dollar format
     *
     * @param float $price
     * @return string
     */
    public static function formatPriceToDollar($price)
    {
        return '$ ' . number_format($price, 2);
    }

    public static function formatPriceToKhr($price)
    {
        return '៛ ' . number_format($price, 2, '.', ',');
    }
}
