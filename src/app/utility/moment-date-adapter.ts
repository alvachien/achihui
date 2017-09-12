import { DateAdapter, MdDateFormats } from '@angular/material';
import * as moment from 'moment';

export const MomentDateFormat: string = 'YYYY-MM-DD';

const MONTHS = {
    'long': moment.months,
    'short': moment.monthsShort,
    'narrow': moment.monthsShort
};
const DAYS = {
    'long': moment.weekdays,
    'short': moment.weekdaysShort,
    'narrow': moment.weekdaysMin
}

export const MOMENT_DATE_FORMATS: MdDateFormats = {
    parse: {
        dateInput: MomentDateFormat,
    },
    display: {
        dateInput: { year: 'numeric', month: 'numeric', day: 'numeric' },
        monthYearLabel: { year: 'numeric', month: 'short' },
        dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
        monthYearA11yLabel: { year: 'numeric', month: 'long' },
    }
};

export class MomentDateAdapter extends DateAdapter<moment.Moment> {

    /**
     * Gets the year component of the given date.
     * @param date The date to extract the year from.
     * @returns The year component.
     */
    getYear(date: moment.Moment): number {
        console.log(`entering getYear.. ${date}`);
        return date.year();
    }

    /**
     * Gets the month component of the given date.
     * @param date The date to extract the month from.
     * @returns The month component (0-indexed, 0 = January).
     */
    getMonth(date: moment.Moment): number {
        console.log(`entering getMonth.. ${date}`);
        return date.month();
    }

    /**
     * Gets the date of the month component of the given date.
     * @param date The date to extract the date of the month from.
     * @returns The month component (1-indexed, 1 = first of month).
     */
    getDate(date: moment.Moment): number {
        console.log(`entering getDate.. ${date}`);
        return date.date();
    }

    /**
     * Gets the day of the week component of the given date.
     * @param date The date to extract the day of the week from.
     * @returns The month component (0-indexed, 0 = Sunday).
     */
    getDayOfWeek(date: moment.Moment): number {
        console.log("entering getDayOfWeek...");
        return date.day();
    }

    /**
     * Gets a list of names for the months.
     * @param style The naming style (e.g. long = 'January', short = 'Jan', narrow = 'J').
     * @returns An ordered list of all month names, starting with January.
     */
    getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
        console.log("entering getMonthNames...");
        return MONTHS[style]();
    }

    /**
     * Gets a list of names for the dates of the month.
     * @returns An ordered list of all date of the month names, starting with '1'.
     */
    getDateNames(): string[] {
        console.log("entering getDateNames...");
        const dateNames = [];
        for (let i = 1; i <= 31; i++) {
            dateNames.push(i.toString());
        }

        return dateNames;
    }

    /**
     * Gets a list of names for the days of the week.
     * @param style The naming style (e.g. long = 'Sunday', short = 'Sun', narrow = 'S').
     * @returns An ordered list of all weekday names, starting with Sunday.
     */
    getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
        console.log("entering getDayOfWeekNames...");
        return DAYS[style]();
    }

    /**
     * Gets the name for the year of the given date.
     * @param date The date to get the year name for.
     * @returns The name of the given year (e.g. '2017').
     */
    getYearName(date: moment.Moment): string {
        console.log("entering getYearName...");
        return date.year().toString();
    }

    /**
     * Gets the first day of the week.
     * @returns The first day of the week (0-indexed, 0 = Sunday).
     */
    getFirstDayOfWeek(): number {
        console.log("entering getFirstDayOfWeek...");
        return 1; // Monday
    }

    /**
     * Gets the number of days in the month of the given date.
     * @param date The date whose month should be checked.
     * @returns The number of days in the month of the given date.
     */
    getNumDaysInMonth(date: moment.Moment): number {
        console.log(`entering getNumDaysInMonth.. ${date}`);
        return date.daysInMonth();
    }

    /**
     * Clones the given date.
     * @param date The date to clone
     * @returns A new date equal to the given date.
     */
    clone(date: moment.Moment): moment.Moment {
        console.log(`entering clone.. ${date}`);
        return date.clone();
    }

    /**
     * Creates a date with the given year, month, and date. Does not allow over/under-flow of the
     * month and date.
     * @param year The full year of the date. (e.g. 89 means the year 89, not the year 1989).
     * @param month The month of the date (0-indexed, 0 = January). Must be an integer 0 - 11.
     * @param date The date of month of the date. Must be an integer 1 - length of the given month.
     * @returns The new date, or null if invalid.
     */
    createDate(year: number, month: number, date: number): moment.Moment {
        console.log("entering createDate...");
        const value = year + '-' + (month + 1) + '-' + date;
        const theDate = moment(value, MomentDateFormat);
        return theDate.isValid() ? theDate : null;
    }

    /**
     * Gets today's date.
     * @returns Today's date.
     */
    today(): moment.Moment {
        console.log("entering today...");
        return moment();
    }

    /**
     * Parses a date from a value.
     * @param value The value to parse.
     * @param parseFormat The expected format of the value being parsed
     *     (type is implementation-dependent).
     * @returns The parsed date, or null if date could not be parsed.
     */
    parse(value: any, parseFormat: any): moment.Moment | null {
        console.log(`entering parse.. ${value} ${parseFormat}`);
        return moment(value, parseFormat);
    }

    /**
     * Formats a date as a string.
     * @param date The value to parse.
     * @param displayFormat The format to use to display the date as a string.
     * @returns The parsed date, or null if date could not be parsed.
     */
    format(date: moment.Moment, displayFormat: any): string {
        console.log(`entering format.. ${date}`);
        return date.format(MomentDateFormat);
    }

    /**
     * Adds the given number of years to the date. Years are counted as if flipping 12 pages on the
     * calendar for each year and then finding the closest date in the new month. For example when
     * adding 1 year to Feb 29, 2016, the resulting date will be Feb 28, 2017.
     * @param date The date to add years to.
     * @param years The number of years to add (may be negative).
     * @returns A new date equal to the given one with the specified number of years added.
     */
    addCalendarYears(date: moment.Moment, years: number): moment.Moment {
        console.log(`entering addCalendarYears.. ${date}`);
        return date.clone().add(years, 'years');
    }
    /**
     * Adds the given number of months to the date. Months are counted as if flipping a page on the
     * calendar for each month and then finding the closest date in the new month. For example when
     * adding 1 month to Jan 31, 2017, the resulting date will be Feb 28, 2017.
     * @param date The date to add months to.
     * @param months The number of months to add (may be negative).
     * @returns A new date equal to the given one with the specified number of months added.
     */
    addCalendarMonths(date: moment.Moment, months: number): moment.Moment {
        console.log(`entering addCalendarMonths.. ${date}`);
        // console.log('date', date);
        // console.log('newdate', date.clone().add(months, 'months'));

        return date.clone().add(months, 'months');
    }

    /**
     * Adds the given number of days to the date. Days are counted as if moving one cell on the
     * calendar for each day.
     * @param date The date to add days to.
     * @param days The number of days to add (may be negative).
     * @returns A new date equal to the given one with the specified number of days added.
     */
    addCalendarDays(date: moment.Moment, days: number): moment.Moment {
        console.log(`entering addCalendarDays.. ${date}`);
        return date.clone().add(days, 'days');
    }

    /**
     * Gets the RFC 3339 compatible date string (https://tools.ietf.org/html/rfc3339)  for the given
     * date.
     * @param date The date to get the ISO date string for.
     * @returns The ISO date string date string.
     */
    getISODateString(date: moment.Moment): string {
        console.log(`entering getISODateString.. ${date}`);
        return date.toISOString();
    }

    /**
     * Checks whether the given object is considered a date instance by this DateAdapter.
     * @param obj The object to check
     * @returns Whether the object is a date instance.
     */
    isDateInstance(obj: any): boolean {
        console.log(`entering isDateInstance.. ${obj}, ${typeof obj}`);
        return obj instanceof moment;
    }

    /**
     * Checks whether the given date is valid.
     * @param date The date to check.
     * @returns Whether the date is valid.
     */
    isValid(date: moment.Moment): boolean {
        console.log(`entering isValid.. ${date},  ` + typeof date);
        return date.isValid();
    }
}
