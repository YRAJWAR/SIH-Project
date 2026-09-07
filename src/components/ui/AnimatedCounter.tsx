'use client';

import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
    target: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
}

export default function AnimatedCounter({ target, duration = 2000, prefix = '', suffix = '', decimals = 0 }: AnimatedCounterProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);

    const formatted = decimals > 0
        ? count.toFixed(decimals)
        : count.toLocaleString('en-IN');

    return (
        <span className="tabular-nums font-bold">
            {prefix}{formatted}{suffix}
        </span>
    );
}
