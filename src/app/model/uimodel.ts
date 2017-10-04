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

  public SourceAccountName: string;
  public TargetAccountName: string;
  public SourceControlCenterName: string;
  public TargetControlCenterName: string;
  public SourceOrderName: string;
  public TargetOrderName: string;

  constructor() {
    this.TranDate = moment();
  }

  public generateDocument(): HIHFinance.Document {
    let doc: HIHFinance.Document = new HIHFinance.Document();
    doc.DocType = hih.FinanceDocType_Transfer;
    doc.TranDate = this.TranDate.clone();
    doc.Desp = this.Desp;
    doc.TranCurr = this.TranCurr;
    if (this.ExgRate) {
      doc.ExgRate = this.ExgRate;
    }
    if (this.ExgRate_Plan) {
      doc.ExgRate_Plan = this.ExgRate_Plan;
    }

    let docitem = new HIHFinance.DocumentItem();
    docitem.ItemId = 1;
    docitem.AccountId = this.SourceAccountId;
    docitem.ControlCenterId = this.SourceControlCenterId;
    docitem.OrderId = this.SourceOrderId;
    docitem.TranType = hih.FinanceTranType_TransferOut;
    docitem.TranAmount = this.TranAmount;
    docitem.Desp = this.Desp;
    doc.Items.push(docitem);

    docitem = new HIHFinance.DocumentItem();
    docitem.ItemId = 2;
    docitem.AccountId = this.TargetAccountId;
    docitem.TranType = hih.FinanceTranType_TransferIn;
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
      if (di.TranType === hih.FinanceTranType_TransferOut) {
        this.SourceAccountId = di.AccountId;
        this.SourceControlCenterId = di.ControlCenterId;
        this.SourceOrderId = di.OrderId;
        this.TranAmount = di.TranAmount;
      } else if (di.TranType === hih.FinanceTranType_TransferIn) {
        this.TargetAccountId = di.AccountId;
        this.TargetControlCenterId = di.ControlCenterId;
        this.TargetOrderId = di.OrderId;
      }
    }
  }
}

export class UIRepeatFrequency {
  public Id: hih.RepeatFrequency;
  public DisplayString: string;

  public static getRepeatFrequencies(): UIRepeatFrequency[] {
    let rst: UIRepeatFrequency[] = new Array<UIRepeatFrequency>();
    let item: UIRepeatFrequency = new UIRepeatFrequency();
    item.Id = hih.RepeatFrequency.Month;
    item.DisplayString = 'RepeatFrequency.Month';
    rst.push(item);
    item = new UIRepeatFrequency();
    item.Id = hih.RepeatFrequency.Fortnight;
    item.DisplayString = 'RepeatFrequency.Fortnight';
    rst.push(item);
    item = new UIRepeatFrequency();
    item.Id = hih.RepeatFrequency.Week;
    item.DisplayString = 'RepeatFrequency.Week';
    rst.push(item);
    item = new UIRepeatFrequency();
    item.Id = hih.RepeatFrequency.Day;
    item.DisplayString = 'RepeatFrequency.Day';
    rst.push(item);
    item = new UIRepeatFrequency();
    item.Id = hih.RepeatFrequency.Quarter;
    item.DisplayString = 'RepeatFrequency.Quarter';
    rst.push(item);
    item = new UIRepeatFrequency();
    item.Id = hih.RepeatFrequency.HalfYear;
    item.DisplayString = 'RepeatFrequency.HalfYear';
    rst.push(item);
    item = new UIRepeatFrequency();
    item.Id = hih.RepeatFrequency.Year;
    item.DisplayString = 'RepeatFrequency.Year';
    rst.push(item);
    item = new UIRepeatFrequency();
    item.Id = hih.RepeatFrequency.Manual;
    item.DisplayString = 'RepeatFrequency.Manual';
    rst.push(item);
    return rst;
  }
}

/**
 * Advance payment: UI part
 */
export class UIFinAdvPayDocument {
  public DocumentObject: HIHFinance.Document;
  public AccountObject: HIHFinance.Account;

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
    doc.DocType = hih.FinanceDocType_AdvancePayment;
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
      this.DocumentObject = new HIHFinance.Document();
      this.DocumentObject.onSetData(doc);
      this.AccountObject = new HIHFinance.Account();
      this.AccountObject.onSetData(doc.accountVM);

      this.TranDate = doc.tranDate.clone();
      this.TranCurr = doc.tranCurr;
      this.Desp = doc.desp;

      if (doc.items.length !== 1) {
        throw Error('Failed to parse document');
      }
      let fitem = doc.items[0];
      this.SourceAccountId = +fitem.accountID;
      this.SourceControlCenterId = +fitem.controlCenterID;
      this.SourceOrderId = +fitem.orderID;
      this.SourceTranType = +fitem.tranType;

      this.AdvPayAccount.onSetData(doc.accountVM.advancePaymentInfo);

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
    doc.DocType = hih.FinanceDocType_CurrencyExchange;
    doc.Desp = this.Desp;
    doc.TranCurr = this.SourceTranCurr;
    doc.TranCurr2 = this.TargetTranCurr;
    doc.ExgRate = this.SourceExchangeRate;
    doc.ExgRate2 = this.TargetExchangeRate;

    let docitem = new HIHFinance.DocumentItem();
    docitem.ItemId = 1;
    docitem.AccountId = this.SourceAccountId;
    docitem.ControlCenterId = this.SourceControlCenterId;
    docitem.OrderId = this.SourceOrderId;
    docitem.TranType = hih.FinanceTranType_TransferOut;
    docitem.TranAmount = this.SourceTranAmount;
    docitem.Desp = this.Desp;
    doc.Items.push(docitem);

    docitem = new HIHFinance.DocumentItem();
    docitem.ItemId = 2;
    docitem.AccountId = this.TargetAccountId;
    docitem.TranType = hih.FinanceTranType_TransferIn;
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
      if (di.TranType === hih.FinanceTranType_TransferOut) {
        this.SourceAccountId = di.AccountId;
        this.SourceControlCenterId = di.ControlCenterId;
        this.SourceOrderId = di.OrderId;
        this.SourceTranAmount = di.TranAmount;
        this.SourceTranCurr = doc.TranCurr;
        this.SourceExchangeRate = doc.ExgRate;
      } else if (di.TranType === hih.FinanceTranType_TransferIn) {
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

  constructor(model: any = null) {
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

  hasSubItems() {
    if (this.subItems) {
      return this.subItems.length > 0;
    }
    return false;
  }

  hasParent() {
    return !!this.parent;
  }

  mapSubItems(list: SidenavItem[]) {
    if (list) {
      list.forEach((item, index) => {
        list[index] = new SidenavItem(item);
      });

      return list;
    }
  }

  isRouteString() {
    return this.route instanceof String || typeof this.route === 'string';
  }
}
