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



export const getCurrentWeekDates = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Calculate Monday (start of week)
    const monday = new Date(now);
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Adjust for Sunday being day 0
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    // Calculate Sunday (end of week)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { monday, sunday };
};


export const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diff = day === 0 ? -6 : 1 - day; // Adjust for Monday start
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

export const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};