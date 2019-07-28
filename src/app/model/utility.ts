import { dateSplitChar } from './common';
import { DocumentItem } from './financemodel';

/**
 * Utility class in Model
 */
export class ModelUtility {
  /**
   * Convert date to string
   * @param dt an instance of Date
   * @returns a result string
   */
  public static Date2String(dt: Date): string {
    // From: http://stackoverflow.com/questions/1056728/where-can-i-find-documentation-on-formatting-a-date-in-javascript
    // let curr_date : string = dt.getDate().toString();
    // let curr_month : string = (dt.getMonth() + 1).toString(); //Months are zero based
    // let curr_year : string = dt.getFullYear().toString();
    // return (curr_date + "-" + curr_month + "-" + curr_year);

    let y: number = dt.getFullYear();
    let m: number = dt.getMonth() + 1;
    let d: number = dt.getDate();
    return y.toString() + dateSplitChar + (m < 10 ? ('0' + m) : m).toString() + dateSplitChar + (d < 10 ? ('0' + d) : d).toString();
  }

  /**
   * Parse string to Date
   * @param s string to parse
   * @returns a new Date
   */
  public static String2Date(s: string): Date {
    if (!s) {
      return new Date();
    }

    let ss: any = (s.split(dateSplitChar));
    let y: number = parseInt(ss[0], 10);
    let m: number = parseInt(ss[1], 10);
    let d: number = parseInt(ss[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m - 1, d);
    } else {
      return new Date();
    }
  }

  /**
   * Workout the distance between two days
   * @param first First date
   * @param second Second date
   * @returns number between two days
   */
  public static DaysBetween(first: Date, second: Date): number {

    // Copy date parts of the timestamps, discarding the time parts.
    let one: Date = new Date(first.getFullYear(), first.getMonth(), first.getDate());
    let two: Date = new Date(second.getFullYear(), second.getMonth(), second.getDate());

    // Do the math.
    let millisecondsPerDay: number = 1000 * 60 * 60 * 24;
    let millisBetween: number = two.getTime() - one.getTime();
    let days: number = millisBetween / millisecondsPerDay;

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
    let isValid: boolean = false;

    if (strMail.indexOf('@') >= 1) {
      let mValidDom: string = strMail.substr(strMail.indexOf('@') + 1);
      if (mValidDom.indexOf('@') === -1) {
        if (mValidDom.indexOf('.') >= 1) {
          let mValidDomE: string = mValidDom.substr(mValidDom.indexOf('.') + 1);
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
    let lengthDf: number = strField.length;
    let bResult: boolean = false;

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
    let passLevel: number = 0;

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
    let valuesSoFar: any = Object.create(undefined);
    for (let i: number = 0; i < strarray.length; ++i) {
      let value: any = strarray[i];
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
    return y.toString() + dateSplitChar + (m < 10 ? ('0' + m) : m).toString();
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

    let nMax: number = 0;
    for (let item of items) {
      if (item.ItemId > nMax) {
        nMax = item.ItemId;
      }
    }

    return nMax + 1;
  }
}
