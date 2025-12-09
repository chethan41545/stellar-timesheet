export function formatDate(dateInput: Date | string, formatString: string): string {
    const date = new Date(dateInput);

    if (isNaN(date.getTime())) {
        throw new Error('Invalid date input');
    }

    const replacements: { [key: string]: string } = {
        // Year
        'YYYY': date.getFullYear().toString(),
        'YY': date.getFullYear().toString().slice(-2),

        // Month
        'MM': (date.getMonth() + 1).toString().padStart(2, '0'),
        'M': (date.getMonth() + 1).toString(),

        // Day
        'DD': date.getDate().toString().padStart(2, '0'),
        'D': date.getDate().toString(),

        // Hours
        'HH': date.getHours().toString().padStart(2, '0'),
        'H': date.getHours().toString(),
        'hh': (date.getHours() % 12 || 12).toString().padStart(2, '0'),
        'h': (date.getHours() % 12 || 12).toString(),

        // Minutes
        'mm': date.getMinutes().toString().padStart(2, '0'),
        'm': date.getMinutes().toString(),

        // Seconds
        'ss': date.getSeconds().toString().padStart(2, '0'),
        's': date.getSeconds().toString(),

        // AM/PM
        'A': date.getHours() >= 12 ? 'PM' : 'AM',
        'a': date.getHours() >= 12 ? 'pm' : 'am',
    };

    return formatString.replace(
        /YYYY|YY|MM|M|DD|D|HH|H|hh|h|mm|m|ss|s|A|a/g,
        (match) => replacements[match] || match
    );
}