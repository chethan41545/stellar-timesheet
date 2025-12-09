import { useEffect, useState } from "react";


export function useDebouncedValue<T>(value: T, delay = 350) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export const handleChangephone = (e: any, field: any): void => {
    // Remove all non-digit characters
    const rawPhoneNumber = e.target.value.replace(/\D/g, '');

    // Prevent formatting if input is "0000000000" or "0000000000000"
    if (rawPhoneNumber === '0000000000' || rawPhoneNumber === '0000000000000') {
        return;
    }

    // Format the phone number as (###) ###-####
    let formattedPhoneNumberWithSpaces = rawPhoneNumber;

    if (rawPhoneNumber.length >= 10) {
        formattedPhoneNumberWithSpaces = rawPhoneNumber.replace(
            /(\d{3})(\d{3})(\d{4}).*/,
            '($1) $2-$3'
        );
    }

    // Update the input value
    field.onChange(formattedPhoneNumberWithSpaces);
};
