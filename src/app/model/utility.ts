import { dateSplitChar, LogLevel } from './common';
import { DocumentItem } from './financemodel';
import { environment } from '../../environments/environment';

export enum ConsoleLogTypeEnum {
  log = 0,
  debug = 1,
  warn = 2,
  error = 3,
}

/**
 * Utility class in Model
 */
export class ModelUtility {
  /**
   * Workout the distance between two days
   * @param first First date
   * @param second Second date
   * @returns number between two days
   */
  public static DaysBetween(first: Date, second: Date): number {
    // Copy date parts of the timestamps, discarding the time parts.
    const one: Date = new Date(first.getFullYear(), first.getMonth(), first.getDate());
    const two: Date = new Date(second.getFullYear(), second.getMonth(), second.getDate());

    // Do the math.
    const millisecondsPerDay: number = 1000 * 60 * 60 * 24;
    const millisBetween: number = two.getTime() - one.getTime();
    const days: number = millisBetween / millisecondsPerDay;

    // Round down.
    return Math.floor(days);
  }

  /**
   * Round a number to 2 digits
   * @param num Number to do the rounding
   */
  public static Round2Two(num: number): number {
    // return +(Math.round(num + "e+2")  + "e-2");
    return Math.round(num * 100) / 100;
  }

  /**
   * Check mail format
   * @param strMail String of the mail
   * @returns true if strMail is valid
   */
  public static CheckMail(strMail: string): boolean {
    let isValid = false;

    if (strMail.indexOf('@') >= 1) {
      const mValidDom: string = strMail.substr(strMail.indexOf('@') + 1);
      if (mValidDom.indexOf('@') === -1) {
        if (mValidDom.indexOf('.') >= 1) {
          const mValidDomE: string = mValidDom.substr(mValidDom.indexOf('.') + 1);
          if (mValidDomE.length >= 1) {
            isValid = true;
          }
        }
      }
    }

    return isValid;
  }

  /**
   * Check the length of string
   * @param strField String to be checked
   * @param minlength Min. length allowed
   * @param maxLength Max. length allowed
   * @returns true if the string meet the length check
   */
  public static CheckStringLength(strField: string, minlength: number, maxLength: number): boolean {
    const lengthDf: number = strField.length;
    let bResult = false;

    if (lengthDf >= minlength && lengthDf <= maxLength) {
      bResult = true;
    }

    return bResult;
  }

  /**
   * Get strength level of a password
   * @param strField Password to be check
   * @returns number of level
   */
  public static GetPasswordStrengthLevel(strField: string): number {
    let passLevel = 0;

    if (strField.match(/[a-z]/g)) {
      passLevel++;
    }
    if (strField.match(/[A-Z]/g)) {
      passLevel++;
    }
    if (strField.match(/[0-9]/g)) {
      passLevel++;
    }
    if (strField.length < 5) {
      if (passLevel >= 1) {
        passLevel--;
      }
    } else if (strField.length >= 20) {
      passLevel++;
    }

    return passLevel;
  }

  /**
   * Check duplicated entries in an array
   * @param strarray Array to be check
   * @returns true indicates duplicated entries exist
   */
  public static hasDuplicatesInStringArray(strarray: string): boolean {
    const valuesSoFar = Object.create(null);
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < strarray.length; i++) {
      const value = strarray[i];
      if (value in valuesSoFar) {
        return true;
      }
      valuesSoFar[value] = true;
    }
    return false;
  }

  /**
   * Provide a number with prefix
   * @param num Number to be work
   * @param length Length specified in prefix
   * @returns a string
   * @example Input: num=2,length=3; Output: 002
   */
  public static prefixInteger(num: number, length: number): string {
    return (Array(length).join('0') + num).slice(-length);
  }

  /**
   * Get display string for Year/Month
   * @param y Year
   * @param m Month
   * @returns a string
   * Example:
   * @example Input: y=2018,m=8; Output: 2018-08
   * @example Input: y=2018,m=11, Output: 2018-11
   */
  public static getYearMonthDisplayString(y: number, m: number): string {
    return y.toString() + dateSplitChar + (m < 10 ? '0' + m : m).toString();
  }

  /**
   * Get next ID for Finance Document Item
   * @param items Existing Document Items
   * @returns Next suitable ID
   */
  public static getFinanceNextItemID(items: DocumentItem[]): number {
    if (items.length <= 0) {
      return 1;
    }

    let nMax = 0;
    for (const item of items) {
      if (item.ItemId > nMax) {
        nMax = item.ItemId;
      }
    }

    return nMax + 1;
  }

  public static writeConsoleLog(log: string, logType: ConsoleLogTypeEnum = ConsoleLogTypeEnum.log): void {
    if (log) {
      switch (logType) {
        case ConsoleLogTypeEnum.debug:
          if (environment.LoggingLevel >= LogLevel.Debug) {
            // eslint-disable-next-line no-console
            console.debug(log);
          }
          break;

        case ConsoleLogTypeEnum.warn:
          if (environment.LoggingLevel >= LogLevel.Warning) {
            // eslint-disable-next-line no-console
            console.warn(log);
          }
          break;

        case ConsoleLogTypeEnum.error:
          if (environment.LoggingLevel >= LogLevel.Error) {
            // eslint-disable-next-line no-console
            console.error(log);
          }
          break;

        case ConsoleLogTypeEnum.log:
        default:
          if (environment.LoggingLevel >= LogLevel.Info) {
            // eslint-disable-next-line no-console
            console.log(log);
          }
          break;
      }
    }
  }
}
