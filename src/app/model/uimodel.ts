import { environment } from '../../environments/environment';
import * as hih from './common';
import * as HIHFinance from './financemodel';
import * as moment from 'moment';

/**
 * Advance payment: UI part
 */
export class UIFinAdvPayDocument {
  private _desp: string;
  private _tranAmount: number;
  private _tranCurr: string;
  public TranDate: moment.Moment;
  get TranAmount(): number {
    return this._tranAmount;
  }
  set TranAmount(amt: number) {
    this._tranAmount = amt;
  }
  get Desp(): string {
    return this._desp;
  }
  set Desp(dsp: string) {
    this._desp = dsp;
  }
  get TranCurr(): string {
    return this._tranCurr;
  }
  set TranCurr(tcur: string) {
    this._tranCurr = tcur;
  }

  public SourceTranType: number;
  public SourceAccountId: number;
  public SourceControlCenterId: number;
  public SourceOrderId: number;

  public AdvPayAccount: HIHFinance.AccountExtraAdvancePayment;

  constructor() {
    this.AdvPayAccount = new HIHFinance.AccountExtraAdvancePayment();
    this.TranDate = moment();
  }
  public generateDocument(isADP?: boolean): HIHFinance.Document {
    let doc: HIHFinance.Document = new HIHFinance.Document();
    if (isADP) {
      doc.DocType = hih.financeDocTypeAdvancePayment;
    } else {
      doc.DocType = hih.financeDocTypeAdvanceReceived;
    }
    doc.Desp = this.Desp;
    doc.TranCurr = this.TranCurr;
    doc.TranDate = this.TranDate.clone();

    let fitem: HIHFinance.DocumentItem = new HIHFinance.DocumentItem();
    fitem.ItemId = 1;
    fitem.AccountId = this.SourceAccountId;
    fitem.ControlCenterId = this.SourceControlCenterId;
    fitem.OrderId = this.SourceOrderId;
    if (isADP) {
      fitem.TranType = hih.financeTranTypeAdvancePaymentOut;
    } else {
      fitem.TranType = hih.financeTranTypeAdvanceReceiveIn;
    }
    // fitem.TranType = this.SourceTranType;
    fitem.TranAmount = this.TranAmount;
    fitem.Desp = this.Desp;
    doc.Items.push(fitem);

    return doc;
  }

  public parseDocument(doc: HIHFinance.Document | any): void {
    if (doc instanceof HIHFinance.Document) {
      this.TranDate = doc.TranDate.clone();
      this.TranCurr = doc.TranCurr;
      this.Desp = doc.Desp;

      if (doc.Items.length < 0) {
        throw Error('Failed to parse document');
      }

      let idx: number = doc.Items.findIndex((item: HIHFinance.DocumentItem) => {
        return item.TranType !== hih.financeTranTypeOpeningAsset
          && item.TranType !== hih.financeTranTypeOpeningLiability;
      });
      if (idx === -1) {
        throw Error('Failed to parse document');
      }
      let fitem: HIHFinance.DocumentItem = doc.Items[idx];
      this.SourceAccountId = fitem.AccountId;
      this.SourceControlCenterId = fitem.ControlCenterId;
      this.SourceOrderId = fitem.OrderId;
      this.TranAmount = fitem.TranAmount;
      this.SourceTranType = fitem.TranType;
    } else {
      let docobj: HIHFinance.Document = new HIHFinance.Document();
      docobj.onSetData(doc);
      let acntobj: HIHFinance.Account = new HIHFinance.Account();
      acntobj.onSetData(doc.accountVM);

      this.TranDate = docobj.TranDate.clone();
      this.TranCurr = docobj.TranCurr;
      this.Desp = docobj.Desp;

      if (docobj.Items.length < 0) {
        throw Error('Failed to parse document');
      }
      let idx: number = docobj.Items.findIndex((item: HIHFinance.DocumentItem) => {
        return item.TranType !== hih.financeTranTypeOpeningAsset
          && item.TranType !== hih.financeTranTypeOpeningLiability;
      });
      if (idx === -1) {
        throw Error('Failed to parse document');
      }
      let fitem: any = docobj.Items[idx];
      this.SourceAccountId = +fitem.AccountId;
      this.SourceControlCenterId = +fitem.ControlCenterId;
      this.SourceOrderId = +fitem.OrderId;
      this.SourceTranType = +fitem.TranType;
      this.TranAmount = +fitem.TranAmount;

      this.AdvPayAccount.onSetData(doc.accountVM.extraInfo_ADP);
    }
  }
}

// Nav Item
export class SidenavItem {
  name: string;
  icon: string;
  color: string;
  route: any;
  parent: SidenavItem;
  subItems: SidenavItem[];
  position: number;
  badge: string;
  badgeColor: string;
  customClass: string;

  constructor(model?: any) {
    if (model) {
      this.name = model.name;
      this.icon = model.icon;
      this.color = model.color;
      this.route = model.route;
      this.parent = model.parent;
      this.subItems = this.mapSubItems(model.subItems);
      this.position = model.position;
      this.badge = model.badge;
      this.badgeColor = model.badgeColor;
      this.customClass = model.customClass;
    }
  }

  hasSubItems(): boolean {
    if (this.subItems) {
      return this.subItems.length > 0;
    }

    return false;
  }

  hasParent(): boolean {
    return !!this.parent;
  }

  mapSubItems(list: SidenavItem[]): SidenavItem[] {
    if (list) {
      list.forEach((item: any, index: number) => {
        list[index] = new SidenavItem(item);
      });

      return list;
    }
  }

  isRouteString(): boolean {
    return this.route instanceof String || typeof this.route === 'string';
  }
}

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
export function BuildupAccountForSelection(acnts: HIHFinance.Account[], acntctg: HIHFinance.AccountCategory[],
  ctgyFilter?: HIHFinance.IAccountCategoryFilter): UIAccountForSelection[] {
  let arrst: UIAccountForSelection[] = [];

  if (acnts && acnts.length > 0) {
    for (let acnt of acnts) {
      let rst: UIAccountForSelection = new UIAccountForSelection();
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
        for (let ctgy of acntctg) {
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
  let arrst: UIOrderForSelection[] = [];

  if (orders && orders.length > 0) {
    for (let ord of orders) {
      let rst: UIOrderForSelection = new UIOrderForSelection();
      rst.Id = ord.Id;
      rst.Name = ord.Name;
      rst._validFrom = ord._validFrom.clone();
      rst._validTo = ord._validTo.clone();

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
