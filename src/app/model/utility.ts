import { DateSplitChar } from './common';

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
    return y.toString() + DateSplitChar + (m < 10 ? ('0' + m) : m).toString() + DateSplitChar + (d < 10 ? ('0' + d) : d).toString();
  }

  public static String2Date(s: string): Date {
    if (!s)
      return new Date();

    let ss = (s.split(DateSplitChar));
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
    let millisecondsPerDay = 1000 * 60 * 60 * 24;
    let millisBetween = two.getTime() - one.getTime();
    let days = millisBetween / millisecondsPerDay;

    // Round down.
    return Math.floor(days);
  }

  public static Round2Two(num: number): number {
    //return +(Math.round(num + "e+2")  + "e-2");
    return Math.round(num * 100) / 100;
  }

  public static CheckMail(strMail: string): boolean {
    let isValid: boolean = false;

    if (strMail.indexOf('@') >= 1) {
      let m_valid_dom = strMail.substr(strMail.indexOf('@') + 1);
      if (m_valid_dom.indexOf('@') === -1) {
        if (m_valid_dom.indexOf('.') >= 1) {
          let m_valid_dom_e = m_valid_dom.substr(m_valid_dom.indexOf('.') + 1);
          if (m_valid_dom_e.length >= 1) {
            isValid = true;
          }
        }
      }
    }

    return isValid;
  }

  public static CheckStringLength(strField: string, minlength: number, maxLength: number): boolean {
    let length_df: number = strField.length;
    let bResult: boolean = false;

    if (length_df >= minlength && length_df <= maxLength) {
      bResult = true;
    }

    return bResult;
  }

  public static GetPasswordStrengthLevel(strField: string): number {
    let pass_level: number = 0;

    if (strField.match(/[a-z]/g)) {
      pass_level++;
    }
    if (strField.match(/[A-Z]/g)) {
      pass_level++;
    }
    if (strField.match(/[0-9]/g)) {
      pass_level++;
    }
    if (strField.length < 5) {
      if (pass_level >= 1) pass_level--;
    } else if (strField.length >= 20) {
      pass_level++;
    }

    return pass_level;
  }

  public static hasDuplicatesInStringArray(strarray: string): boolean {
    let valuesSoFar = Object.create(null);
    for (let i = 0; i < strarray.length; ++i) {
      let value = strarray[i];
      if (value in valuesSoFar) {
        return true;
      }
      valuesSoFar[value] = true;
    }
    return false;
  }

  public static prefixInteger(num, length: number): string {
    return (Array(length).join('0') + num).slice(-length);
  } 
}
