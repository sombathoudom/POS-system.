import { useState } from 'react';

import { useEffect } from 'react';

interface UseDebounceProps {
    value: string;
    delay: number;
}
export default function useDebounce({ value, delay }: UseDebounceProps) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
