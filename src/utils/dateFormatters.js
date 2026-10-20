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

const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_DAY = 86400;

/**
 * Formats a number of seconds as a compact duration, e.g. `359d 19h 1m 39s`.
 *
 * Zero-valued units are dropped, so an exact hour reads `2h` rather than `0d 2h 0m 0s`, and a
 * duration of zero reads `0s`. `null`, `undefined`, negative and non-finite values (`NaN`,
 * `Infinity`) return the placeholder, which lets a listing cell or detail row render a missing or
 * invalid value without a guard at the call site.
 *
 * Deliberately plain arithmetic rather than dayjs's duration plugin: that plugin normalises a
 * duration into years and months, so its `hours()` is the component of a year/month/day breakdown
 * and does not line up with a total day count. Mixing the two reports 31,086,099 s as
 * `359d 5h 1m 39s` instead of `359d 19h 1m 39s`.
 *
 * @param {number|null|undefined} seconds total seconds; fractions are floored.
 * @param {string} [placeholder] returned for `null`, `undefined`, negative and non-finite values.
 * @returns {string}
 */
export function formatDuration(seconds, placeholder = '—') {
    if (seconds === null || seconds === undefined) {
        return placeholder;
    }

    const total = Math.floor(seconds);
    if (!Number.isFinite(total) || total < 0) {
        return placeholder;
    }

    const parts = [
        [Math.floor(total / SECONDS_IN_DAY), 'd'],
        [Math.floor((total % SECONDS_IN_DAY) / SECONDS_IN_HOUR), 'h'],
        [Math.floor((total % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE), 'm'],
        [total % SECONDS_IN_MINUTE, 's'],
    ].filter(([amount]) => amount > 0);

    return parts.length === 0 ? '0s' : parts.map(([amount, unit]) => `${amount}${unit}`).join(' ');
}

export function nowInTimezone(tz = 'UTC', format = 'YYYY-MM-DD HH:mm:ss') {
    return dayjs().tz(tz).format(format);
}

export { dayjs };
