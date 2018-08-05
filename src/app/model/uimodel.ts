import { environment } from '../../environments/environment';
import * as hih from './common';
import * as HIHFinance from './financemodel';
import * as moment from 'moment';

/**
 * Transfer document in UI part
 */
export class UIFinTransferDocument {
  public TranAmount: number;
  public TranCurr: string;
  public TranDate: moment.Moment;
  public Desp: string;
  public ExgRate: number;
  public ExgRate_Plan: boolean;

  public SourceAccountId: number;
  public TargetAccountId: number;
  public SourceControlCenterId: number;
  public TargetControlCenterId: number;
  public SourceOrderId: number;
  public TargetOrderId: number;

  constructor() {
    this.TranDate = moment();
  }

  public generateDocument(): HIHFinance.Document {
    let doc: HIHFinance.Document = new HIHFinance.Document();
    doc.DocType = hih.financeDocTypeTransfer;
    doc.TranDate = this.TranDate.clone();
    doc.Desp = this.Desp;
    doc.TranCurr = this.TranCurr;
    if (this.ExgRate) {
      doc.ExgRate = this.ExgRate;
    }
    if (this.ExgRate_Plan) {
      doc.ExgRate_Plan = this.ExgRate_Plan;
    }

    let docitem: HIHFinance.DocumentItem = new HIHFinance.DocumentItem();
    docitem.ItemId = 1;
    docitem.AccountId = this.SourceAccountId;
    docitem.ControlCenterId = this.SourceControlCenterId;
    docitem.OrderId = this.SourceOrderId;
    docitem.TranType = hih.financeTranTypeTransferOut;
    docitem.TranAmount = this.TranAmount;
    docitem.Desp = this.Desp;
    doc.Items.push(docitem);

    docitem = new HIHFinance.DocumentItem();
    docitem.ItemId = 2;
    docitem.AccountId = this.TargetAccountId;
    docitem.TranType = hih.financeTranTypeTransferIn;
    docitem.ControlCenterId = this.TargetControlCenterId;
    docitem.OrderId = this.TargetOrderId;
    docitem.TranAmount = this.TranAmount;
    docitem.Desp = this.Desp;
    doc.Items.push(docitem);

    return doc;
  }

  public parseDocument(doc: HIHFinance.Document): void {
    this.TranDate = doc.TranDate;
    this.TranCurr = doc.TranCurr;
    this.Desp = doc.Desp;
    if (doc.ExgRate) {
      this.ExgRate = doc.ExgRate;
    }
    if (doc.ExgRate_Plan) {
      this.ExgRate_Plan = doc.ExgRate_Plan;
    }

    for (let di of doc.Items) {
      if (di.TranType === hih.financeTranTypeTransferOut) {
        this.SourceAccountId = di.AccountId;
        this.SourceControlCenterId = di.ControlCenterId;
        this.SourceOrderId = di.OrderId;
        this.TranAmount = di.TranAmount;
      } else if (di.TranType === hih.financeTranTypeTransferIn) {
        this.TargetAccountId = di.AccountId;
        this.TargetControlCenterId = di.ControlCenterId;
        this.TargetOrderId = di.OrderId;
      }
    }
  }
}

/**
 * Advance payment: UI part
 */
export class UIFinAdvPayDocument {
  public TranAmount: number;
  public TranDate: moment.Moment;
  public Desp: string;
  public TranCurr: string;

  public SourceTranType: number;
  public SourceAccountId: number;
  public SourceControlCenterId: number;
  public SourceOrderId: number;

  public AdvPayAccount: HIHFinance.AccountExtraAdvancePayment;
  public TmpDocs: HIHFinance.TemplateDocADP[] = [];

  constructor() {
    this.AdvPayAccount = new HIHFinance.AccountExtraAdvancePayment();
    this.TranDate = moment();
  }
  public generateDocument(): HIHFinance.Document {
    let doc: HIHFinance.Document = new HIHFinance.Document();
    doc.DocType = hih.financeDocTypeAdvancePayment;
    doc.Desp = this.Desp;
    doc.TranCurr = this.TranCurr;
    doc.TranDate = this.TranDate.clone();

    let fitem: HIHFinance.DocumentItem = new HIHFinance.DocumentItem();
    fitem.ItemId = 1;
    fitem.AccountId = this.SourceAccountId;
    fitem.ControlCenterId = this.SourceControlCenterId;
    fitem.OrderId = this.SourceOrderId;
    fitem.TranType = this.SourceTranType;
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

      if (doc.Items.length !== 1) {
        throw Error('Failed to parse document');
      }

      let fitem: HIHFinance.DocumentItem = doc.Items[0];
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

      if (docobj.Items.length !== 1) {
        throw Error('Failed to parse document');
      }
      let fitem: any = docobj.Items[0];
      this.SourceAccountId = +fitem.AccountId;
      this.SourceControlCenterId = +fitem.ControlCenterId;
      this.SourceOrderId = +fitem.OrderId;
      this.SourceTranType = +fitem.TranType;

      this.AdvPayAccount.onSetData(doc.accountVM.extraInfo_ADP);

      for (let it of doc.tmpDocs) {
        let tdoc: HIHFinance.TemplateDocADP = new HIHFinance.TemplateDocADP();
        tdoc.onSetData(it);
        this.TmpDocs.push(tdoc);
      }
    }
  }
}

/**
 * Currency exchange document in UI part
 */
export class UIFinCurrencyExchangeDocument {
  public TranDate: moment.Moment;
  public Desp: string;

  public SourceTranCurr: string;
  public TargetTranCurr: string;
  public SourceExchangeRate: number;
  public TargetExchangeRate: number;
  // For exchange document, the exchange rate must know!
  // public SourceExchangeRatePlan: boolean;
  // public TargetExchangeRatePlan: boolean;
  public SourceTranAmount: number;
  public TargetTranAmount: number;
  public SourceAccountId: number;
  public TargetAccountId: number;
  public SourceControlCenterId: number;
  public TargetControlCenterId: number;
  public SourceOrderId: number;
  public TargetOrderId: number;

  public prvdocs: HIHFinance.DocumentWithPlanExgRate[] = [];

  constructor() {
    this.TranDate = moment();
  }

  public generateDocument(): HIHFinance.Document {
    let doc: HIHFinance.Document = new HIHFinance.Document();
    doc.DocType = hih.financeDocTypeCurrencyExchange;
    doc.Desp = this.Desp;
    doc.TranCurr = this.SourceTranCurr;
    doc.TranCurr2 = this.TargetTranCurr;
    doc.ExgRate = this.SourceExchangeRate;
    doc.ExgRate2 = this.TargetExchangeRate;

    let docitem: HIHFinance.DocumentItem = new HIHFinance.DocumentItem();
    docitem.ItemId = 1;
    docitem.AccountId = this.SourceAccountId;
    docitem.ControlCenterId = this.SourceControlCenterId;
    docitem.OrderId = this.SourceOrderId;
    docitem.TranType = hih.financeTranTypeTransferOut;
    docitem.TranAmount = this.SourceTranAmount;
    docitem.Desp = this.Desp;
    doc.Items.push(docitem);

    docitem = new HIHFinance.DocumentItem();
    docitem.ItemId = 2;
    docitem.AccountId = this.TargetAccountId;
    docitem.TranType = hih.financeTranTypeTransferIn;
    docitem.ControlCenterId = this.TargetControlCenterId;
    docitem.OrderId = this.TargetOrderId;
    docitem.TranAmount = this.TargetTranAmount;
    docitem.UseCurr2 = true;
    docitem.Desp = this.Desp;
    doc.Items.push(docitem);

    return doc;
  }

  public parseDocument(doc: HIHFinance.Document): void {
    this.TranDate = doc.TranDate;
    this.Desp = doc.Desp;

    for (let di of doc.Items) {
      if (di.TranType === hih.financeTranTypeTransferOut) {
        this.SourceAccountId = di.AccountId;
        this.SourceControlCenterId = di.ControlCenterId;
        this.SourceOrderId = di.OrderId;
        this.SourceTranAmount = di.TranAmount;
        this.SourceTranCurr = doc.TranCurr;
        this.SourceExchangeRate = doc.ExgRate;
      } else if (di.TranType === hih.financeTranTypeTransferIn) {
        this.TargetAccountId = di.AccountId;
        this.TargetControlCenterId = di.ControlCenterId;
        this.TargetOrderId = di.OrderId;
        this.TargetTranAmount = di.TranAmount;
        this.TargetTranCurr = doc.TranCurr2;
        this.TargetExchangeRate = doc.ExgRate2;
      }
    }
  }
}

/**
 * Asset Operation document in UI part
 */
export class UIFinAssetOperationDocument {
  public isBuyin: boolean;
  public TranDate: moment.Moment;
  public Desp: string;

  public TranCurr: string;
  public ExgRate: number;
  public ExgRate_Plan: boolean;
  public TranAmount: number;
  public AccountId: number;
  public ControlCenterId: number;
  public OrderId: number;
  public TranType: number;

  public AssetAccount: HIHFinance.AccountExtraAsset;

  constructor() {
    this.TranDate = moment();
    this.AssetAccount = new HIHFinance.AccountExtraAsset();
  }

  public generateDocument(): HIHFinance.Document {
    let doc: HIHFinance.Document = new HIHFinance.Document();
    if (this.isBuyin) {
      doc.DocType = hih.financeDocTypeAssetBuyIn;
    } else {
      doc.DocType = hih.financeDocTypeAssetSoldOut;
    }

    doc.Desp = this.Desp;
    doc.TranCurr = this.TranCurr;
    doc.ExgRate = this.ExgRate;
    doc.ExgRate_Plan = this.ExgRate_Plan;

    let docitem: HIHFinance.DocumentItem = new HIHFinance.DocumentItem();
    docitem.ItemId = 1;
    docitem.AccountId = this.AccountId;
    docitem.ControlCenterId = this.ControlCenterId;
    docitem.OrderId = this.OrderId;
    docitem.TranType = this.TranType;
    docitem.TranAmount = this.TranAmount;
    docitem.Desp = this.Desp;
    doc.Items.push(docitem);

    return doc;
  }

  public parseDocument(doc: HIHFinance.Document | any): void {
    if (doc instanceof HIHFinance.Document) {
      this.TranDate = doc.TranDate.clone();
      this.Desp = doc.Desp;
      this.ExgRate = doc.ExgRate;
      this.ExgRate_Plan = doc.ExgRate_Plan;
      this.TranCurr = doc.TranCurr;

      this.AccountId = doc.Items[0].AccountId;
      this.ControlCenterId = doc.Items[0].ControlCenterId;
      this.OrderId = doc.Items[0].OrderId;
      this.TranAmount = doc.Items[0].TranAmount;
      this.TranType = doc.Items[0].TranType;
    } else {
      let docobj: HIHFinance.Document = new HIHFinance.Document();
      docobj.onSetData(doc);
      let acntobj: HIHFinance.Account = new HIHFinance.Account();
      acntobj.onSetData(doc.accountVM);

      this.TranDate = docobj.TranDate.clone();
      this.Desp = docobj.Desp;
      this.ExgRate = docobj.ExgRate;
      this.ExgRate_Plan = docobj.ExgRate_Plan;
      this.TranCurr = docobj.TranCurr;

      this.AccountId = docobj.Items[0].AccountId;
      this.ControlCenterId = docobj.Items[0].ControlCenterId;
      this.OrderId = docobj.Items[0].OrderId;
      this.TranAmount = docobj.Items[0].TranAmount;
      this.TranType = docobj.Items[0].TranType;

      this.AssetAccount.onSetData(doc.accountVM.extraInfo_AS);
    }
  }
}

/**
 * UI Loan document
 */
export class UIFinLoanDocument {
  private _tranAmount: number;
  private _desp: string;
  private _tranCurr: string;
  private _isLendTo: boolean;

  get TranAmount(): number {
    return this._tranAmount;
  }
  set TranAmount(tamt: number) {
    this._tranAmount = tamt;
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
  get isLendTo(): boolean {
    return this._isLendTo;
  }
  set isLendTo(ilt: boolean) {
    this._isLendTo = ilt;
  }
  public TranDate: moment.Moment;

  public SourceAccountId: number;
  public SourceControlCenterId: number;
  public SourceOrderId: number;
  // public SourceTranType: number; // For each template doc, it shall use tran. type

  public LoanAccount: HIHFinance.AccountExtraLoan;
  public TmpDocs: HIHFinance.TemplateDocLoan[] = [];

  constructor() {
    this.LoanAccount = new HIHFinance.AccountExtraLoan();
    this.TranDate = moment();
    this.isLendTo = false;
  }
  public generateDocument(isLendTo?: boolean): HIHFinance.Document {
    let doc: HIHFinance.Document = new HIHFinance.Document();
    if (this.isLendTo) {
      doc.DocType = hih.financeDocTypeLendTo;
    } else {
      doc.DocType = hih.financeDocTypeBorrowFrom;
    }
    doc.Desp = this.Desp;
    doc.TranCurr = this.TranCurr;
    doc.TranDate = this.TranDate.clone();

    let fitem: HIHFinance.DocumentItem = new HIHFinance.DocumentItem();
    fitem.ItemId = 1;
    fitem.AccountId = this.SourceAccountId;
    fitem.ControlCenterId = this.SourceControlCenterId;
    fitem.OrderId = this.SourceOrderId;
    if (isLendTo) {
      fitem.TranType = hih.financeTranTypeLendTo;
    } else {
      fitem.TranType = hih.financeTranTypeBorrowFrom;
    }
    fitem.TranAmount = this.TranAmount;
    fitem.Desp = this.Desp;
    doc.Items.push(fitem);

    return doc;
  }

  public parseDocument(doc: HIHFinance.Document | any, isLendTo?: boolean): void {
    if (doc instanceof HIHFinance.Document) {
      this.TranDate = doc.TranDate.clone();
      this.TranCurr = doc.TranCurr;
      this.Desp = doc.Desp;

      if (doc.Items.length < 0) {
        throw Error('Failed to parse document');
      }

      let fitem: HIHFinance.DocumentItem = doc.Items[0];
      this.SourceAccountId = fitem.AccountId;
      this.SourceControlCenterId = fitem.ControlCenterId;
      this.SourceOrderId = fitem.OrderId;
      this.TranAmount = fitem.TranAmount;
    } else {
      let docobj: HIHFinance.Document = new HIHFinance.Document();
      docobj.onSetData(doc);
      let acntobj: HIHFinance.Account = new HIHFinance.Account();
      acntobj.onSetData(doc.accountVM);

      this.TranDate = docobj.TranDate.clone();
      this.TranCurr = docobj.TranCurr;
      this.Desp = docobj.Desp;

      if (docobj.Items.length < 1) {
        throw new Error('Failed to parse document');
      }

      let itemidx: number = -1;
      if (isLendTo) {
        itemidx = docobj.Items.findIndex((val: HIHFinance.DocumentItem) => {
          return val.TranType === hih.financeTranTypeLendTo;
        });
      } else {
        itemidx = docobj.Items.findIndex((val: HIHFinance.DocumentItem) => {
          return val.TranType === hih.financeTranTypeBorrowFrom;
        });
      }
      if (itemidx === -1) {
        throw new Error('No suitable document');
      }
      let fitem: any = docobj.Items[itemidx];
      this.SourceAccountId = +fitem.AccountId;
      this.SourceControlCenterId = +fitem.ControlCenterId;
      this.SourceOrderId = +fitem.OrderId;

      this.LoanAccount.onSetData(doc.accountVM.extraInfo_Loan);

      for (let it of doc.tmpDocs) {
        let tdoc: HIHFinance.TemplateDocLoan = new HIHFinance.TemplateDocLoan();
        tdoc.onSetData(it);

        // if (tdoc.TranType !== this.SourceTranType) {
        //   this.SourceTranType = tdoc.TranType;
        // }

        this.TmpDocs.push(tdoc);
      }
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

    for (let ctgy of acntctg) {
      if (ctgy.ID === rst.CategoryId) {
        rst.CategoryName = ctgy.Name;
        rst.AssetFlag = ctgy.AssetFlag;
      }
    }

    arrst.push(rst);
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

  return arrst;
}
