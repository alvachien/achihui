import { UICommonLabelEnum, QuestionBankTypeEnum, TagTypeEnum, OverviewScopeEnum, RepeatFrequencyEnum } from './common';
import {
  AccountStatusEnum,
  RepaymentMethodEnum,
  TranTypeLevelEnum,
  FinanceQuickAccessTypeEnum,
  PlanTypeEnum,
  Account,
  AccountCategory,
  Order,
  financeAccountCategoryBorrowFrom,
  financeAccountCategoryAsset,
  financeAccountCategoryAdvancePayment,
  IAccountCategoryFilter,
  financeAccountCategoryLendTo,
} from './financemodel';
import { HomeMemberRelationEnum } from './homedef';
import moment from 'moment';
import { LocationTypeEnum } from './librarymodel';
import { SafeAny } from 'src/common';

/**
 * UI Status
 */
export enum UIStatusEnum {
  NotLogin = 0,
  LoggedinNoHomeChosen = 1,
  LoggedinAndHomeChosen = 2,
}

// Filter operator
export enum GeneralFilterOperatorEnum {
  Equal = 1,
  NotEqual = 2,
  Between = 3,
  LargerThan = 4,
  LargerEqual = 5,
  LessThan = 6,
  LessEqual = 7,
  Like = 8, // Like
}

/**
 * Navigation item
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface appNavItems {
  name: string;
  route: string;
}

/**
 * App languages
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface appLanguage {
  displayas: string;
  value: string;
}

// For credits part
export class CreditsComponent {
  // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  Name?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  Version?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  Homepage?: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  GithubRepo?: string;
}

// For UI controls
export class UIRadioButton {
  public id = '';
  public name = '';
  public value: SafeAny;
  public label = '';
  public checked = false;
  public disabled = false;
  public arialabel = '';
}

export class UIRadioButtonGroup {
  public selected: UIRadioButton | null = null;
  public value: SafeAny;
  public disabled = false;
}

export class UIRouteLink {
  public title = '';
  public route = '';
  public icon = '';
}

/**
 * Interface: Table Filter Values
 */
export interface ITableFilterValues {
  text: string;
  value: SafeAny;
  byDefault?: boolean;
}

/**
 * Name value pair
 */
export class UINameValuePair<T> {
  name?: string;
  value?: T;
}

/**
 * UI Display string Enum
 */
export type UIDisplayStringEnum =
  | UICommonLabelEnum
  | QuestionBankTypeEnum
  | TagTypeEnum
  | OverviewScopeEnum
  | AccountStatusEnum
  | RepaymentMethodEnum
  | RepeatFrequencyEnum
  | TranTypeLevelEnum
  | GeneralFilterOperatorEnum
  | FinanceQuickAccessTypeEnum
  | HomeMemberRelationEnum
  | PlanTypeEnum
  | LocationTypeEnum;

/**
 * UI Display string
 */
export class UIDisplayString {
  public value: UIDisplayStringEnum = UICommonLabelEnum.Category;
  public i18nterm = '';
  public displaystring = '';
}

/**
 * Utility class for UI display string
 */
export class UIDisplayStringUtil {
  public static getUICommonLabelStrings(): UIDisplayString[] {
    const arrst: UIDisplayString[] = [];

    for (const se in UICommonLabelEnum) {
      if (Number.isNaN(+se)) {
        // Allowed
      } else {
        arrst.push({
          value: +se,
          i18nterm: UIDisplayStringUtil.getUICommonLabelDisplayString(+se),
          displaystring: '',
        } as UIDisplayString);
      }
    }

    return arrst;
  }

  public static getQuestionBankTypeStrings(): UIDisplayString[] {
    const arrst: UIDisplayString[] = [];

    for (const se in QuestionBankTypeEnum) {
      if (Number.isNaN(+se)) {
        // Do nothing
      } else {
        arrst.push({
          value: +se,
          i18nterm: UIDisplayStringUtil.getQuestionBankTypeDisplayString(+se),
          displaystring: '',
        } as UIDisplayString);
      }
    }

    return arrst;
  }

  public static getTagTypeStrings(): UIDisplayString[] {
    const arrst: UIDisplayString[] = [];

    for (const se in TagTypeEnum) {
      if (Number.isNaN(+se)) {
        // Do nothing
      } else {
        arrst.push({
          value: +se,
          i18nterm: UIDisplayStringUtil.getTagTypeDisplayString(+se),
          displaystring: '',
        } as UIDisplayString);
      }
    }

    return arrst;
  }

  public static getOverviewScopeStrings(): UIDisplayString[] {
    const arrst: UIDisplayString[] = [];

    for (const se in OverviewScopeEnum) {
      if (Number.isNaN(+se)) {
        // Do nothing
      } else {
        arrst.push({
          value: +se,
          i18nterm: UIDisplayStringUtil.getOverviewScopeDisplayString(+se),
          displaystring: '',
        } as UIDisplayString);
      }
    }

    return arrst;
  }

  public static getAccountStatusStrings(): UIDisplayString[] {
    const arrst: UIDisplayString[] = [];

    for (const se in AccountStatusEnum) {
      if (Number.isNaN(+se)) {
        // Do nothing
      } else {
        arrst.push({
          value: +se,
          i18nterm: UIDisplayStringUtil.getAccountStatusDisplayString(+se),
          displaystring: '',
        } as UIDisplayString);
      }
    }

    return arrst;
  }

  public static getRepaymentMethodStrings(): UIDisplayString[] {
    const arrst: UIDisplayString[] = [];

    for (const se in RepaymentMethodEnum) {
      if (Number.isNaN(+se)) {
        // Do nothing
      } else {
        arrst.push({
          value: +se,
          i18nterm: UIDisplayStringUtil.getRepaymentMethodDisplayString(+se),
          displaystring: '',
        } as UIDisplayString);
      }
    }

    return arrst;
  }

  // public static getEnPOSStrings(): UIDisplayString[] {
  //   const arrst: UIDisplayString[] = [];

  //   for (const pe in EnPOSEnum) {
  //     // if (Number.isNaN(+pe)) {
  //     // } else {
  //     arrst.push({
  //       value: +pe,
  //       i18nterm: UIDisplayStringUtil.getEnPOSDisplayString(pe as EnPOSEnum),
  //       displaystring: '',
  //     });
  //     // }
  //   }

  //   return arrst;
  // }

  public static getRepeatFrequencyDisplayStrings(): UIDisplayString[] {
    const arrst: UIDisplayString[] = [];

    for (const rfe in RepeatFrequencyEnum) {
      if (Number.isNaN(+rfe)) {
        // Do nothing
      } else {
        arrst.push({
          value: +rfe,
          i18nterm: UIDisplayStringUtil.getRepeatFrequencyDisplayString(+rfe as RepeatFrequencyEnum),
          displaystring: '',
        } as UIDisplayString);
      }
    }

    return arrst;
  }

  public static getTranTypeLevelDisplayStrings(): UIDisplayString[] {
    const arrst: UIDisplayString[] = [];

    for (const rfe in TranTypeLevelEnum) {
      if (Number.isNaN(+rfe)) {
        // Do nothing
      } else {
        arrst.push({
          value: +rfe,
          i18nterm: UIDisplayStringUtil.getTranTypeLevelDisplayString(+rfe as TranTypeLevelEnum),
          displaystring: '',
        } as UIDisplayString);
      }
    }

    return arrst;
  }

  public static getGeneralFilterOperatorDisplayStrings(): UIDisplayString[] {
    const arrst: UIDisplayString[] = [];

    for (const rfe in GeneralFilterOperatorEnum) {
      if (Number.isNaN(+rfe)) {
        // Do nothing
      } else {
        arrst.push({
          value: +rfe,
          i18nterm: UIDisplayStringUtil.getGeneralFilterOperatorDisplayString(+rfe as GeneralFilterOperatorEnum),
          displaystring: '',
        } as UIDisplayString);
      }
    }

    return arrst;
  }

  public static getFinanceQuickAccessTypeEnumStrings(): UIDisplayString[] {
    const arrst: UIDisplayString[] = [];

    for (const qat in FinanceQuickAccessTypeEnum) {
      if (Number.isNaN(+qat)) {
        // Do nothing
      } else {
        arrst.push({
          value: +qat,
          i18nterm: UIDisplayStringUtil.getFinanceQuickAccessTypeEnumDisplayString(+qat as FinanceQuickAccessTypeEnum),
          displaystring: '',
        } as UIDisplayString);
      }
    }

    return arrst;
  }

  public static getFinancePlanTypeEnumDisplayStrings(): UIDisplayString[] {
    const arrst: UIDisplayString[] = [];

    for (const qat in PlanTypeEnum) {
      if (Number.isNaN(+qat)) {
        // Do nothing
      } else {
        arrst.push({
          value: +qat,
          i18nterm: UIDisplayStringUtil.getFinancePlanTypeEnumDisplayString(+qat as PlanTypeEnum),
          displaystring: '',
        } as UIDisplayString);
      }
    }

    return arrst;
  }

  public static getHomeMemberRelationEnumStrings(): UIDisplayString[] {
    const arrst: UIDisplayString[] = [];

    for (const qat in HomeMemberRelationEnum) {
      if (Number.isNaN(+qat)) {
        // Do nothing
      } else {
        arrst.push({
          value: +qat,
          i18nterm: UIDisplayStringUtil.getHomeMemberRelationEnumDisplayString(+qat as HomeMemberRelationEnum),
          displaystring: '',
        } as UIDisplayString);
      }
    }

    return arrst;
  }

  public static getLocationTypeEnumDisplayStrings(): UIDisplayString[] {
    const arrst: UIDisplayString[] = [];

    for (const qat in LocationTypeEnum) {
      if (Number.isNaN(+qat)) {
        // Do nothing
      } else {
        arrst.push({
          value: +qat,
          i18nterm: UIDisplayStringUtil.getLocationTypeDisplayString(+qat as LocationTypeEnum),
          displaystring: '',
        } as UIDisplayString);
      }
    }

    return arrst;
  }

  ///////////////////////////////////////////////////////////////////////////////
  // Get display string for each enum
  public static getUICommonLabelDisplayString(le: UICommonLabelEnum): string {
    switch (le) {
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

      case UICommonLabelEnum.DeleteConfirmTitle:
        return 'Common.DeleteConfirmation';

      case UICommonLabelEnum.DeleteConfrimContent:
        return 'Common.ConfirmToDeleteSelectedItem';

      case UICommonLabelEnum.Error:
        return 'Common.Error';

      case UICommonLabelEnum.ChartLegend:
        return 'Common.ChartLegend';

      case UICommonLabelEnum.UpdatedSuccess:
        return 'Common.UpdatedSuccessfully';

      case UICommonLabelEnum.Incoming:
        return 'Finance.Incoming';

      case UICommonLabelEnum.Outgoing:
        return 'Finance.Outgoing';

      case UICommonLabelEnum.DocumentUpdated:
        return 'Finance.DocumentUpdated';

      case UICommonLabelEnum.OperConfirmTitle:
        return 'Common.OperationConfirmation';

      case UICommonLabelEnum.OperConfirmContent:
        return 'Common.OperationConfirmationContent';

      case UICommonLabelEnum.OperationCompleted:
        return 'Common.OperationCompleted';

      default:
        return '';
    }
  }

  public static getQuestionBankTypeDisplayString(se: QuestionBankTypeEnum): string {
    switch (se) {
      case QuestionBankTypeEnum.EssayQuestion:
        return 'Learning.EssayQuestion';

      case QuestionBankTypeEnum.MultipleChoice:
        return 'Learning.MultipleChoice';

      default:
        return '';
    }
  }

  public static getLocationTypeDisplayString(se: LocationTypeEnum): string {
    switch (se) {
      case LocationTypeEnum.PaperBook:
        return 'Library.PaperBook';

      case LocationTypeEnum.EBook:
        return 'Library.EBook';

      default:
        return '';
    }
  }

  public static getTagTypeDisplayString(se: TagTypeEnum): string {
    switch (se) {
      case TagTypeEnum.FinanceDocumentItem:
        return 'Finance.Document';

      case TagTypeEnum.LearnQuestionBank:
        return 'Learning.QuestionBank';

      default:
        return '';
    }
  }

  public static getOverviewScopeDisplayString(se: OverviewScopeEnum): string {
    switch (se) {
      case OverviewScopeEnum.CurrentMonth:
        return 'Common.CurrentMonth';

      case OverviewScopeEnum.CurrentYear:
        return 'Common.CurrentYear';

      case OverviewScopeEnum.PreviousMonth:
        return 'Common.PreviousMonth';

      case OverviewScopeEnum.PreviousYear:
        return 'Common.PreviousYear';

      case OverviewScopeEnum.CurrentQuarter:
        return 'Common.CurrentQuarter';

      case OverviewScopeEnum.PreviousQuarter:
        return 'Common.PreviousQuarter';

      case OverviewScopeEnum.CurrentWeek:
        return 'Common.CurrentWeek';

      case OverviewScopeEnum.PreviousWeek:
        return 'Common.PreviousWeek';

      case OverviewScopeEnum.All:
        return 'Common.All';

      default:
        return '';
    }
  }

  public static getAccountStatusDisplayString(stat: AccountStatusEnum): string {
    switch (stat) {
      case AccountStatusEnum.Normal:
        return 'Finance.AccountStatusNormal';
      case AccountStatusEnum.Closed:
        return 'Finance.AccountStatusClosed';
      case AccountStatusEnum.Frozen:
        return 'Finance.AccountStatusFrozen';
      default:
        return '';
    }
  }

  public static getRepaymentMethodDisplayString(pm: RepaymentMethodEnum): string {
    switch (pm) {
      case RepaymentMethodEnum.EqualPrincipal:
        return 'Finance.EqualPrincipal';
      case RepaymentMethodEnum.EqualPrincipalAndInterset:
        return 'Finance.EqualPrincipalAndInterest';
      case RepaymentMethodEnum.DueRepayment:
        return 'Finance.DueRepayment';
      case RepaymentMethodEnum.Informal:
        return 'Finance.Unspecified';
      default:
        return '';
    }
  }

  // public static getEnPOSDisplayString(ep: EnPOSEnum): string {
  //   switch (ep) {
  //     case EnPOSEnum.n: return 'Sys.EnPOS.n';
  //     case EnPOSEnum.pron: return 'Sys.EnPOS.pron';
  //     case EnPOSEnum.adj: return 'Sys.EnPOS.adj';
  //     case EnPOSEnum.adv: return 'Sys.EnPOS.adv';
  //     case EnPOSEnum.v: return 'Sys.EnPOS.v';
  //     case EnPOSEnum.num: return 'Sys.EnPOS.num';
  //     case EnPOSEnum.art: return 'Sys.EnPOS.art';
  //     case EnPOSEnum.prep: return 'Sys.EnPOS.prep';
  //     case EnPOSEnum.conj: return 'Sys.EnPOS.conj';
  //     case EnPOSEnum.interj: return 'Sys.EnPOS.interj';
  //     case EnPOSEnum.vt: return 'Sys.EnPOS.vt';
  //     case EnPOSEnum.vi: return 'Sys.EnPOS.vi';
  //     default: return '';
  //   }
  // }

  public static getRepeatFrequencyDisplayString(frq: RepeatFrequencyEnum): string {
    switch (frq) {
      case RepeatFrequencyEnum.Day:
        return 'RepeatFrequency.Day';
      case RepeatFrequencyEnum.Month:
        return 'RepeatFrequency.Month';
      case RepeatFrequencyEnum.Fortnight:
        return 'RepeatFrequency.Fortnight';
      case RepeatFrequencyEnum.Manual:
        return 'RepeatFrequency.Manual';
      case RepeatFrequencyEnum.HalfYear:
        return 'RepeatFrequency.HalfYear';
      case RepeatFrequencyEnum.Year:
        return 'RepeatFrequency.Year';
      case RepeatFrequencyEnum.Quarter:
        return 'RepeatFrequency.Quarter';
      case RepeatFrequencyEnum.Week:
        return 'RepeatFrequency.Week';
      default:
        return '';
    }
  }

  public static getTranTypeLevelDisplayString(ttl: TranTypeLevelEnum): string {
    switch (ttl) {
      case TranTypeLevelEnum.TopLevel:
        return 'Finance.TranTypeTopLevel';
      case TranTypeLevelEnum.FirstLevel:
        return 'Finance.TranTypeFirstLevel';
      case TranTypeLevelEnum.SecondLevel:
        return 'Finance.TranTypeSecondLevel';
      default:
        return '';
    }
  }

  public static getGeneralFilterOperatorDisplayString(opte: GeneralFilterOperatorEnum): string {
    switch (opte) {
      case GeneralFilterOperatorEnum.Between:
        return 'Sys.Operator.Between';
      case GeneralFilterOperatorEnum.Equal:
        return 'Sys.Operator.Equal';
      case GeneralFilterOperatorEnum.LargerEqual:
        return 'Sys.Operator.LargerEqual';
      case GeneralFilterOperatorEnum.LargerThan:
        return 'Sys.Operator.LargerThan';
      case GeneralFilterOperatorEnum.LessEqual:
        return 'Sys.Operator.LessEqual';
      case GeneralFilterOperatorEnum.LessThan:
        return 'Sys.Operator.LessThan';
      case GeneralFilterOperatorEnum.NotEqual:
        return 'Sys.Operator.NotEqual';
      case GeneralFilterOperatorEnum.Like:
        return 'Sys.Operator.Like';
      default:
        return '';
    }
  }

  public static getFinanceQuickAccessTypeEnumDisplayString(qte: FinanceQuickAccessTypeEnum): string {
    switch (qte) {
      case FinanceQuickAccessTypeEnum.Account:
        return 'Finance.Account';
      case FinanceQuickAccessTypeEnum.Document:
        return 'Finance.Document';
      case FinanceQuickAccessTypeEnum.ControlCenter:
        return 'Finance.ControlCenter';
      case FinanceQuickAccessTypeEnum.Order:
        return 'Finance.Activity';
      default:
        return '';
    }
  }

  public static getHomeMemberRelationEnumDisplayString(re: HomeMemberRelationEnum): string {
    switch (re) {
      case HomeMemberRelationEnum.Self:
        return 'Sys.MemRel.Self';
      case HomeMemberRelationEnum.Couple:
        return 'Sys.MemRel.Couple';
      case HomeMemberRelationEnum.Child:
        return 'Sys.MemRel.Children';
      case HomeMemberRelationEnum.Parent:
        return 'Sys.MemRel.Parent';
      default:
        return '';
    }
  }

  public static getFinancePlanTypeEnumDisplayString(pte: PlanTypeEnum): string {
    switch (pte) {
      case PlanTypeEnum.Account:
        return 'Finance.Account';
      case PlanTypeEnum.AccountCategory:
        return 'Finance.AccountCategory';
      case PlanTypeEnum.ControlCenter:
        return 'Finance.ControlCenter';
      case PlanTypeEnum.TranType:
        return 'Finance.TransactionType';
      default:
        return '';
    }
  }
}

export enum GeneralFilterValueType {
  number = 1,
  string = 2,
  date = 3,
  boolean = 4,
}

/**
 * General Filter Item
 */
export class GeneralFilterItem {
  fieldName = '';
  operator: GeneralFilterOperatorEnum = GeneralFilterOperatorEnum.Equal;
  lowValue: SafeAny;
  highValue: SafeAny;
  valueType: GeneralFilterValueType = GeneralFilterValueType.string;
}

export function getFilterString(filters: GeneralFilterItem[]): string {
  const arfields: string[] = [];
  filters.forEach((val) => {
    if (val && val.fieldName && arfields.indexOf(val.fieldName) === -1) {
      arfields.push(val.fieldName);
    }
  });
  let filterstr = '';
  arfields.forEach((fieldname) => {
    const subfilters: string[] = [];
    filters.forEach((val) => {
      if (val.fieldName === fieldname) {
        const subflt = getSingleFilterString(val);
        if (subflt.length > 0) {
          subfilters.push(subflt);
        }
      }
    });

    if (subfilters.length > 0) {
      let subfltstr = '';
      if (subfilters.length === 1) {
        subfltstr = subfilters[0];
      } else {
        // More than one item
        subfilters.forEach((sf) => {
          subfltstr = subfltstr.length === 0 ? `(${sf}` : `${subfltstr} or ${sf}`;
        });
        subfltstr = `${subfltstr})`;
      }

      filterstr = filterstr.length === 0 ? `${subfltstr}` : `${filterstr} and ${subfltstr}`;
    }
  });
  return filterstr;
}

/**
 * Get Filters for OData API
 * @param flt Single Filter
 */
export function getSingleFilterString(flt: GeneralFilterItem): string {
  let subfilter = '';
  switch (flt.operator) {
    case GeneralFilterOperatorEnum.Equal: {
      switch (flt.valueType) {
        case GeneralFilterValueType.string:
          subfilter = `${flt.fieldName} eq '${flt.lowValue}'`;
          break;
        case GeneralFilterValueType.boolean:
          if (flt.lowValue) {
            subfilter = `${flt.fieldName} eq true`;
          } else {
            subfilter = `${flt.fieldName} eq false`;
          }
          break;
        case GeneralFilterValueType.date:
          subfilter = `${flt.fieldName} eq ${flt.lowValue}`;
          break;
        case GeneralFilterValueType.number:
          subfilter = `${flt.fieldName} eq ${flt.lowValue}`;
          break;
        default:
          break;
      }
      break;
    }

    case GeneralFilterOperatorEnum.Between: {
      switch (flt.valueType) {
        case GeneralFilterValueType.string:
          subfilter = `${flt.fieldName} ge '${flt.lowValue}' and ${flt.fieldName} le '${flt.highValue}'`;
          break;
        case GeneralFilterValueType.boolean:
          break;
        case GeneralFilterValueType.date:
          subfilter = `${flt.fieldName} ge ${flt.lowValue} and ${flt.fieldName} le ${flt.highValue}`;
          break;
        case GeneralFilterValueType.number:
          subfilter = `${flt.fieldName} ge ${flt.lowValue} and ${flt.fieldName} le ${flt.highValue}`;
          break;
        default:
          break;
      }
      break;
    }

    case GeneralFilterOperatorEnum.LargerEqual: {
      // ge
      switch (flt.valueType) {
        case GeneralFilterValueType.string:
          subfilter = `${flt.fieldName} ge '${flt.lowValue}'`;
          break;
        case GeneralFilterValueType.boolean:
          break;
        case GeneralFilterValueType.date:
          subfilter = `${flt.fieldName} ge ${flt.lowValue}`;
          break;
        case GeneralFilterValueType.number:
          subfilter = `${flt.fieldName} ge ${flt.lowValue}`;
          break;
        default:
          break;
      }
      break;
    }

    case GeneralFilterOperatorEnum.LargerThan: {
      // gt
      switch (flt.valueType) {
        case GeneralFilterValueType.string:
          subfilter = `${flt.fieldName} gt '${flt.lowValue}'`;
          break;
        case GeneralFilterValueType.boolean:
          break;
        case GeneralFilterValueType.date:
          subfilter = `${flt.fieldName} gt ${flt.lowValue}`;
          break;
        case GeneralFilterValueType.number:
          subfilter = `${flt.fieldName} gt ${flt.lowValue}`;
          break;
        default:
          break;
      }
      break;
    }

    case GeneralFilterOperatorEnum.LessEqual: {
      // le
      switch (flt.valueType) {
        case GeneralFilterValueType.string:
          subfilter = `${flt.fieldName} le '${flt.lowValue}'`;
          break;
        case GeneralFilterValueType.boolean:
          break;
        case GeneralFilterValueType.date:
          subfilter = `${flt.fieldName} le ${flt.lowValue}`;
          break;
        case GeneralFilterValueType.number:
          subfilter = `${flt.fieldName} le ${flt.lowValue}`;
          break;
        default:
          break;
      }
      break;
    }

    case GeneralFilterOperatorEnum.LessThan: {
      // lt
      switch (flt.valueType) {
        case GeneralFilterValueType.string:
          subfilter = `${flt.fieldName} lt '${flt.lowValue}'`;
          break;
        case GeneralFilterValueType.boolean:
          break;
        case GeneralFilterValueType.date:
          subfilter = `${flt.fieldName} lt ${flt.lowValue}`;
          break;
        case GeneralFilterValueType.number:
          subfilter = `${flt.fieldName} lt ${flt.lowValue}`;
          break;
        default:
          break;
      }
      break;
    }

    case GeneralFilterOperatorEnum.Like: {
      switch (flt.valueType) {
        case GeneralFilterValueType.string:
          subfilter = `contains(${flt.fieldName}, '${flt.lowValue}')`;
          break;
        case GeneralFilterValueType.boolean:
          break;
        case GeneralFilterValueType.date:
          break;
        case GeneralFilterValueType.number:
          break;
        default:
          break;
      }
      break;
    }

    case GeneralFilterOperatorEnum.NotEqual: {
      // ne
      switch (flt.valueType) {
        case GeneralFilterValueType.string:
          subfilter = `${flt.fieldName} ne '${flt.lowValue}'`;
          break;
        case GeneralFilterValueType.boolean:
          break;
        case GeneralFilterValueType.date:
          subfilter = `${flt.fieldName} ne ${flt.lowValue}`;
          break;
        case GeneralFilterValueType.number:
          subfilter = `${flt.fieldName} ne ${flt.lowValue}`;
          break;
        default:
          break;
      }
      break;
    }

    default:
      break;
  }

  return subfilter;
}

/**
 * Account for selection
 */
export class UIAccountForSelection {
  public Id = 0;
  public CategoryId = 0;
  public Name = '';
  public CategoryName = '';
  public AssetFlag = false;
  public Status: AccountStatusEnum = AccountStatusEnum.Normal;
}

/**
 * Buildup accounts for select
 * @param acnts Accounts
 * @param acntctg Account categories
 * @param skipadp Skip ADP accounts
 * @param skiploan Skip Loan accounts
 * @param skipasset Skip Asset accounts
 */
export function BuildupAccountForSelection(
  acnts: Account[],
  acntctg: AccountCategory[],
  ctgyFilter?: IAccountCategoryFilter
): UIAccountForSelection[] {
  const arrst: UIAccountForSelection[] = [];

  if (acnts && acnts.length > 0) {
    for (const acnt of acnts) {
      const rst: UIAccountForSelection = new UIAccountForSelection();
      rst.CategoryId = acnt.CategoryId ?? 0;
      rst.Id = acnt.Id ?? 0;
      rst.Name = acnt.Name ?? '';
      rst.Status = acnt.Status;

      // Skip some categories
      if (
        ctgyFilter !== undefined &&
        ctgyFilter.skipADP === true &&
        acnt.CategoryId === financeAccountCategoryAdvancePayment
      ) {
        continue;
      }
      if (
        ctgyFilter !== undefined &&
        ctgyFilter.skipLoan === true &&
        (acnt.CategoryId === financeAccountCategoryBorrowFrom || acnt.CategoryId === financeAccountCategoryLendTo)
      ) {
        continue;
      }
      if (
        ctgyFilter !== undefined &&
        ctgyFilter.skipAsset === true &&
        acnt.CategoryId === financeAccountCategoryAsset
      ) {
        continue;
      }

      if (acntctg && acntctg.length > 0) {
        for (const ctgy of acntctg) {
          if (ctgy.ID === rst.CategoryId) {
            rst.CategoryName = ctgy.Name ?? '';
            rst.AssetFlag = ctgy.AssetFlag ?? true;
          }
        }
      }

      arrst.push(rst);
    }
  }

  return arrst;
}

/**
 * Order for selection
 */
export class UIOrderForSelection {
  public Id = 0;
  public Name = '';
  public _validFrom: moment.Moment = moment();
  public _validTo: moment.Moment = moment();
}

/**
 * Buildup orders for select
 * @param orders Orders
 * @param skipinv Skip invalid orders
 */
export function BuildupOrderForSelection(orders: Order[], skipinv?: boolean): UIOrderForSelection[] {
  const arrst: UIOrderForSelection[] = [];

  if (orders && orders.length > 0) {
    for (const ord of orders) {
      const rst: UIOrderForSelection = new UIOrderForSelection();
      if (ord.Id) {
        rst.Id = ord.Id;
      }
      rst.Name = ord.Name;
      rst._validFrom = ord.ValidFrom?.clone() ?? moment();
      rst._validTo = ord.ValidTo?.clone() ?? moment();

      // Skip some categories
      if (skipinv) {
        if (rst._validFrom > moment() || rst._validTo < moment()) {
          continue;
        }
      }

      arrst.push(rst);
    }
  }

  return arrst;
}

/**
 * Buildup orders for select
 * @param orders Orders
 * @param momentCreation moment of creation
 */
export function BuildupOrderForSelectionEx(orders: Order[], momentCreation: moment.Moment): UIOrderForSelection[] {
  const arrst: UIOrderForSelection[] = [];

  if (orders && orders.length > 0) {
    for (const ord of orders) {
      const rst: UIOrderForSelection = new UIOrderForSelection();
      if (ord.Id) {
        rst.Id = ord.Id;
      }
      rst.Name = ord.Name;
      rst._validFrom = ord.ValidFrom?.clone() ?? moment();
      rst._validTo = ord.ValidTo?.clone() ?? moment();

      // Skip some orders
      if (rst._validFrom.isSameOrAfter(momentCreation) || rst._validTo.isBefore(momentCreation)) {
        continue;
      }

      arrst.push(rst);
    }
  }

  return arrst;
}
