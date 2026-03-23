import { describe, it, expect } from 'vitest';
import { formatDate, formatDatetime, formatTime, nowInTimezone } from '@/utils/dateFormatters.js';

describe('formatDate', () => {
    it('formats a valid ISO date with default format', () => {
        expect(formatDate('2024-03-15')).toBe('15.03.2024');
    });

    it('returns empty string for invalid date', () => {
        expect(formatDate('not-a-date')).toBe('');
    });

    it('accepts a custom format', () => {
        expect(formatDate('2024-03-15', 'YYYY/MM/DD')).toBe('2024/03/15');
    });

    it('returns empty string for null', () => {
        expect(formatDate(null)).toBe('');
    });
});

describe('formatDatetime', () => {
    it('formats a valid datetime with default format', () => {
        expect(formatDatetime('2024-03-15 14:30:00')).toBe('15.03.2024 14:30');
    });

    it('returns empty string for invalid datetime', () => {
        expect(formatDatetime('garbage')).toBe('');
    });

    it('accepts a custom format', () => {
        expect(formatDatetime('2024-03-15 14:30:00', 'YYYY-MM-DD')).toBe('2024-03-15');
    });
});

describe('formatTime', () => {
    it('formats a valid time string', () => {
        expect(formatTime('14:30')).toBe('14:30');
    });

    it('formats time with seconds', () => {
        expect(formatTime('14:30:45', 'HH:mm:ss')).toBe('14:30:45');
    });

    it('returns empty string for invalid time', () => {
        expect(formatTime('invalid')).toBe('');
    });
});

describe('nowInTimezone', () => {
    it('returns a string matching datetime pattern for UTC', () => {
        const result = nowInTimezone('UTC');
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it('returns a valid string for a specific timezone', () => {
        const result = nowInTimezone('America/New_York');
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it('accepts a custom format', () => {
        const result = nowInTimezone('UTC', 'YYYY');
        expect(result).toMatch(/^\d{4}$/);
    });
});
