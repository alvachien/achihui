import { UICommonLabelEnum, QuestionBankTypeEnum, TagTypeEnum, OverviewScopeEnum } from './common';

/**
 * UI Status
 */
export enum UIStatusEnum {
  NotLogin = 0,
  LoggedinNoHomeChosen = 1,
  LoggedinAndHomeChosen = 2,
}

/**
 * Navigation item
 */
export interface appNavItems {
  name: string;
  route: string;
}

/**
 * App languages
 */
export interface appLanguage {
  displayas: string;
  value: string;
}

// For credits part
export class CreditsComponent {
  Name: string;
  Version: string;
  Homepage: string;
  GithubRepo: string;
}

// For UI controls
export class UIRadioButton {
  public id: string;
  public name: string;
  public value: any;
  public label: string;
  public checked: boolean;
  public disabled: boolean;
  public arialabel: string;
}

export class UIRadioButtonGroup {
  public selected: UIRadioButton;
  public value: any;
  public disabled: boolean;
}

export class UIRouteLink {
  public title: string;
  public route: string;
  public icon: string;
}

/**
 * Name value pair
 */
export class UINameValuePair<T> {
  name: string;
  value: T;
}

/**
 * UI Display string Enum
 */
export type UIDisplayStringEnum = UICommonLabelEnum | QuestionBankTypeEnum | TagTypeEnum | OverviewScopeEnum;

/**
 * UI Display string
 */
export class UIDisplayString {
  public value: UIDisplayStringEnum;
  public i18nterm: string;
  public displaystring: string;
}

/**
 * Utility class for UI display string
 */
export class UIDisplayStringUtil {
  public static getUICommonLabelStrings(): Array<UIDisplayString> {
    let arrst: Array<UIDisplayString> = new Array<UIDisplayString>();

    for (let se in UICommonLabelEnum) {
      if (Number.isNaN(+se)) {
      } else {
        arrst.push({
          value: +se,
          i18nterm: UIDisplayStringUtil.getUICommonLabelDisplayString(+se),
          displaystring: ''
        });
      }
    }

    return arrst;
  }
  
  public static getQuestionBankTypeStrings(): Array<UIDisplayString> {
    let arrst: Array<UIDisplayString> = new Array<UIDisplayString>();

    for (let se in QuestionBankTypeEnum) {
      if (Number.isNaN(+se)) {
      } else {
        arrst.push({
          value: +se,
          i18nterm: UIDisplayStringUtil.getQuestionBankTypeDisplayString(+se),
          displaystring: ''
        });
      }
    }

    return arrst;
  }
  
  public static getTagTypeStrings(): Array<UIDisplayString> {
    let arrst: Array<UIDisplayString> = new Array<UIDisplayString>();

    for (let se in TagTypeEnum) {
      if (Number.isNaN(+se)) {
      } else {
        arrst.push({
          value: +se,
          i18nterm: UIDisplayStringUtil.getTagTypeDisplayString(+se),
          displaystring: ''
        });
      }
    }

    return arrst;
  }

  public static getOverviewScopeStrings(): Array<UIDisplayString> {
    let arrst: Array<UIDisplayString> = new Array<UIDisplayString>();

    for (let se in OverviewScopeEnum) {
      if (Number.isNaN(+se)) {
      } else {
        arrst.push({
          value: +se,
          i18nterm: UIDisplayStringUtil.getOverviewScopeDisplayString(+se),
          displaystring: ''
        });
      }
    }

    return arrst;
  }

  // Get display string for each enum  
  public static getUICommonLabelDisplayString(le: UICommonLabelEnum): string {
    switch(le) {
      case UICommonLabelEnum.DocumentPosted:
        return 'Finance.DocumentPosted';

      case UICommonLabelEnum.CreateAnotherOne:
        return 'Common.CreateAnotherOne';

      case UICommonLabelEnum.CreatedSuccess:
        return 'Common.CreatedSuccessfully';

      case UICommonLabelEnum.Category:
        return 'Common.Category';

      case UICommonLabelEnum.User:
        return 'Login.User';

      case UICommonLabelEnum.Count:
        return 'Common.Count';

      case UICommonLabelEnum.Total:
        return 'Common.Total';
        
      default:
        return '';
    }
  }

  public static getQuestionBankTypeDisplayString(se: QuestionBankTypeEnum): string {
    switch(se) {
      case QuestionBankTypeEnum.EssayQuestion:
        return 'Learning.EssayQuestion';

      case QuestionBankTypeEnum.MultipleChoice:
        return 'Learning.MultipleChoice';

      default:
        return '';
    }
  }

  public static getTagTypeDisplayString(se: TagTypeEnum): string {
    switch(se) {
      case TagTypeEnum.FinanceDocumentItem:
        return 'Finance.Document';

      case TagTypeEnum.LearnQuestionBank:
        return 'Learning.QuestionBank';

      default:
        return '';
    }
  }

  public static getOverviewScopeDisplayString(se: OverviewScopeEnum): string {
    switch(se) {
      case OverviewScopeEnum.CurrentMonth:
        return 'Common.CurrentMonth';

      case OverviewScopeEnum.CurrentYear:
        return 'Common.CurrentYear';

      case OverviewScopeEnum.PreviousMonth:
        return 'Common.PreviousMonth';

      case OverviewScopeEnum.PreviousYear:
        return 'Common.PreviousYear';

      case OverviewScopeEnum.All:
        return 'Common.All';

      default:
        return '';
    }
  }
}
