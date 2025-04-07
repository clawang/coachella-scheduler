export function convertTimetoDate(date: number, time: string): Date {
    const dates: { [key: number]: string } = {
        418: "2025/04/18",
        419: "2025/04/19",
        420: "2025/04/20"
    };

    if (!dates[date]) console.log("unrecognized date");

    let dateObj = new Date(`${dates[date]} ${time} GMT+00:00`);
    if (dateObj.getUTCHours() < 6) dateObj.setUTCDate(dateObj.getUTCDate() + 1);

    return dateObj;
}

export function toTimeString(date: Date): string {
    let hour = date.getUTCHours();
    const isPM: boolean = hour >= 12;
    if (isPM) hour -= 12;
    if (hour === 0) hour = 12;
    return `${hour}:${formatDigit(date.getUTCMinutes())} ${isPM ? 'PM' : 'AM'}`;
}

function formatDigit(num: number): string {
    return num < 10 ? '0' + num.toString() : num.toString();
}