
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

export enum UICommonLabelEnum {
  DocumentPosted    = 1,
  CreateAnotherOne  = 2,
  CreatedSuccess    = 3
}

export class UICommonLabelUIString {
  public value: UICommonLabelEnum;
  public i18nterm: string;
  public displaystring: string;
}

export class UICommonLabel {
  public static getUICommonLabelStrings(): Array<UICommonLabelUIString> {
    let arrst: Array<UICommonLabelUIString> = new Array<UICommonLabelUIString>();

    for (let se in UICommonLabelEnum) {
      if (Number.isNaN(+se)) {
      } else {
        arrst.push({
          value: +se,
          i18nterm: UICommonLabel.getUICommonLabelDisplayString(+se),
          displaystring: ''
        });
      }
    }

    return arrst;
  }

  public static getUICommonLabelDisplayString(le: UICommonLabelEnum): string {
    switch(le) {
      case UICommonLabelEnum.DocumentPosted:
        return 'Finance.DocumentPosted';

      case UICommonLabelEnum.CreateAnotherOne:
        return 'Common.CreateAnotherOne';

      case UICommonLabelEnum.CreatedSuccess:
        return 'Common.CreatedSuccessfully';
        
      default:
        return '';
    }
  }
}
