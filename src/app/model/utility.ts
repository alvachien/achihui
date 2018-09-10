import { dateSplitChar } from './common';

export class Utility {
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

  public static Round2Two(num: number): number {
    // return +(Math.round(num + "e+2")  + "e-2");
    return Math.round(num * 100) / 100;
  }

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

  public static CheckStringLength(strField: string, minlength: number, maxLength: number): boolean {
    let lengthDf: number = strField.length;
    let bResult: boolean = false;

    if (lengthDf >= minlength && lengthDf <= maxLength) {
      bResult = true;
    }

    return bResult;
  }

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

  public static prefixInteger(num: number, length: number): string {
    return (Array(length).join('0') + num).slice(-length);
  }
}
