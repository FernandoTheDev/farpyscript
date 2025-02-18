<?php

function fib(int|float $n): int|float
{
    static $map = [];
    if (isset($map[$n])) {
        return $map[$n];
    }
    if ($n <= 1) return $n;
    $map[$n] = fib($n - 1) + fib($n - 2);
    return $map[$n];
}

echo fib(500) . PHP_EOL;
