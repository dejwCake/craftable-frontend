import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export function formatDate(date, format = 'DD.MM.YYYY') {
    const d = dayjs(date);
    return d.isValid() ? d.format(format) : '';
}

export function formatDatetime(datetime, format = 'DD.MM.YYYY HH:mm') {
    const d = dayjs(datetime);
    return d.isValid() ? d.format(format) : '';
}

export function formatTime(time, format = 'HH:mm') {
    // '2000-01-01' is here just because dayjs needs a date
    const d = dayjs('2000-01-01 ' + time);
    return d.isValid() ? d.format(format) : '';
}

export function nowInTimezone(tz = 'UTC', format = 'YYYY-MM-DD HH:mm:ss') {
    return dayjs().tz(tz).format(format);
}

export { dayjs };
