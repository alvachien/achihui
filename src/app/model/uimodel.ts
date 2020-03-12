import * as hih from './common';
import * as HIHFinance from './financemodel';
import * as moment from 'moment';

// tslint:disable:variable-name

/**
 * Account for selection
 */
export class UIAccountForSelection {
  public Id: number;
  public CategoryId: number;
  public Name: string;
  public CategoryName: string;
  public AssetFlag: boolean;
  public Status: HIHFinance.AccountStatusEnum;
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
  acnts: HIHFinance.Account[],
  acntctg: HIHFinance.AccountCategory[],
  ctgyFilter?: HIHFinance.IAccountCategoryFilter): UIAccountForSelection[] {
  const arrst: UIAccountForSelection[] = [];

  if (acnts && acnts.length > 0) {
    for (const acnt of acnts) {
      const rst: UIAccountForSelection = new UIAccountForSelection();
      rst.CategoryId = acnt.CategoryId;
      rst.Id = acnt.Id;
      rst.Name = acnt.Name;
      rst.Status = acnt.Status;

      // Skip some categories
      if (ctgyFilter !== undefined
        && ctgyFilter.skipADP === true
        && acnt.CategoryId === hih.financeAccountCategoryAdvancePayment) {
        continue;
      }
      if (ctgyFilter !== undefined
        && ctgyFilter.skipLoan === true
        && (acnt.CategoryId === hih.financeAccountCategoryBorrowFrom
        || acnt.CategoryId === hih.financeAccountCategoryLendTo)) {
        continue;
      }
      if (ctgyFilter !== undefined
        && ctgyFilter.skipAsset === true
        && acnt.CategoryId === hih.financeAccountCategoryAsset) {
        continue;
      }

      if (acntctg && acntctg.length > 0) {
        for (const ctgy of acntctg) {
          if (ctgy.ID === rst.CategoryId) {
            rst.CategoryName = ctgy.Name;
            rst.AssetFlag = ctgy.AssetFlag;
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
  public Id: number;
  public Name: string;
  public _validFrom: moment.Moment;
  public _validTo: moment.Moment;
}

/**
 * Buildup accounts for select
 * @param orders Orders
 * @param skipinv Skip invalid orders
 */
export function BuildupOrderForSelection(orders: HIHFinance.Order[], skipinv?: boolean): UIOrderForSelection[] {
  const arrst: UIOrderForSelection[] = [];

  if (orders && orders.length > 0) {
    for (const ord of orders) {
      const rst: UIOrderForSelection = new UIOrderForSelection();
      rst.Id = ord.Id;
      rst.Name = ord.Name;
      rst._validFrom = ord.ValidFrom.clone();
      rst._validTo = ord.ValidTo.clone();

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

// Normal document Mass Create
export class FinanceNormalDocItemMassCreate {
  public tranDate: moment.Moment;
  public accountID: number;
  public tranType: number;
  public tranAmount: number;
  public tranCurrency: string;
  public controlCenterID?: number;
  public orderID?: number;
  public desp: string;

  // Tag
  public tagTerms: string[];

  get isValid(): boolean {
    if (!this.desp) {
      return false;
    }
    if (this.accountID <= 0) {
      return false;
    }
    if (this.tranType <= 0) {
      return false;
    }
    if (this.tranAmount <= 0) {
      return false;
    }
    if (!this.tranCurrency) {
      return false;
    }
    if (this.controlCenterID) {
      if (this.orderID) {
        return false;
      }
    } else if (this.orderID) {
      if (this.controlCenterID) {
        return false;
      }
    } else {
      return false;
    }
    return true;
  }
}
