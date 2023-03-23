//
// Unit test for financemodel.ts
//

import {
  Currency,
  CurrencyJson,
  AccountCategory,
  AccountCategoryJson,
  Account,
  AccountJson,
  DocumentType,
  DocumentTypeJson,
  AssetCategory,
  AssetCategoryJson,
  AccountExtraAdvancePayment,
  AccountExtraAsset,
  AccountExtraLoan,
  ControlCenter,
  Order,
  SettlementRule,
  Document,
  DocumentItem,
  TemplateDocLoan,
  TemplateDocADP,
  Plan,
  FinanceReportBase,
  AccountStatusEnum,
  RepaymentMethodEnum,
  IAccountVerifyContext,
  financeDocTypeCurrencyExchange,
  financeTranTypeTransferOut,
  financeTranTypeTransferIn,
  FinanceOverviewKeyfigure,
  FinanceReportEntryByAccountAndExpense,
  FinanceReportEntryByTransactionTypeMoM,
  FinanceNormalDocItemMassCreate,
  FinanceReportEntryPerDate,
  FinanceReportEntryMoM,
  FinanceDocumentMassCreateConfirm,
  DocumentCreatedFrequenciesByUser,
  DocumentWithPlanExgRateForUpdate,
  DocumentWithPlanExgRate,
  DocumentItemWithBalance,
  ReportTrendExData,
  MonthOnMonthReport,
  TranTypeReport,
  FinanceReportByAccount,
  BalanceSheetReport,
} from './financemodel';
import * as moment from 'moment';
import * as hih from './common';
import { FakeDataHelper } from '../../testing';

describe('Currency', () => {
  let instance: Currency;

  beforeEach(() => {
    instance = new Currency();
  });

  it('#0. onInit', () => {
    instance.Name = 'test';
    instance.Symbol = '$';
    instance.onInit();
    expect(instance.Name).toBeFalsy();
    expect(instance.Symbol).toBeFalsy();
  });
  it('#1. onVerify: name is must', () => {
    instance.Currency = 'USD';
    instance.Symbol = '$';

    expect(instance.onVerify()).toBeFalsy();
  });
  it('#2. onVerify: currency is must', () => {
    instance.Symbol = '$';
    instance.Name = 'US Dollar';

    expect(instance.onVerify()).toBeFalsy();
  });
  it('#3. onVerify: symbol is must', () => {
    instance.Currency = 'USD';
    instance.Name = 'US Dollar';

    expect(instance.onVerify()).toBeFalsy();
  });
  it('#4. onVerify: valid case', () => {
    instance.Currency = 'USD';
    instance.Symbol = '$';
    instance.Name = 'US Dollar';

    expect(instance.onVerify()).toBeTruthy();
  });

  it('#5. onSetData and writeJSONObject', () => {
    instance.Currency = 'USD';
    instance.Symbol = '$';
    instance.Name = 'US Dollar';

    const jdata: CurrencyJson = instance.writeJSONObject();
    expect(jdata).toBeTruthy();
    expect(jdata.Name).toEqual('US Dollar');
    expect(jdata.Symbol).toEqual('$');
    expect(jdata.Curr).toEqual('USD');

    const instance2: Currency = new Currency();
    instance2.onSetData(jdata);
    expect(instance2.Currency).toEqual(instance.Currency);
    expect(instance2.Name).toEqual(instance.Name);
    expect(instance2.Symbol).toEqual(instance.Symbol);
  });
});

describe('AccountCategory', () => {
  let instance: AccountCategory;

  beforeEach(() => {
    instance = new AccountCategory();
  });

  it('#0. onInit', () => {
    instance.AssetFlag = true;
    instance.Comment = 'test';
    instance.onInit();
    expect(instance.AssetFlag).toBeFalse();
    expect(instance.Comment).toBeNull();
  });

  it('#1. onVerify: name is must', () => {
    instance.AssetFlag = true;
    instance.Comment = 'test';

    expect(instance.onVerify()).toBeFalsy();
  });
  it('#2. onVerify: valid case', () => {
    instance.Name = 'test';
    instance.AssetFlag = true;
    instance.Comment = 'test';

    expect(instance.onVerify()).toBeTruthy();
  });
  it('#5. onSetData and writeJSONObject', () => {
    instance.Name = 'test';
    instance.AssetFlag = true;
    instance.Comment = 'test';

    const jdata: AccountCategoryJson = instance.writeJSONObject();
    expect(jdata).toBeTruthy();
    expect(jdata.Name).toEqual('test');
    expect(jdata.AssetFlag).toEqual(true);
    expect(jdata.Comment).toEqual('test');

    const instance2: AccountCategory = new AccountCategory();
    instance2.onSetData(jdata);
    expect(instance2.Name).toEqual(instance.Name);
    expect(instance2.AssetFlag).toEqual(instance.AssetFlag);
    expect(instance2.Comment).toEqual(instance.Comment);
  });
});

describe('DocumentType', () => {
  let instance: DocumentType;

  beforeEach(() => {
    instance = new DocumentType();
  });

  it('#0. onInit', () => {
    instance.Name = 'test';
    instance.Comment = 'test';
    instance.onInit();
    expect(instance.Name).toBeNull();
    expect(instance.Comment).toBeNull();
  });
  it('#1. onVerify: name is must', () => {
    instance.Comment = 'test';

    expect(instance.onVerify()).toBeFalsy();
  });
  it('#2. onVerify: valid case', () => {
    instance.Name = 'test';
    instance.Comment = 'test';

    expect(instance.onVerify()).toBeTruthy();
  });
  it('#3. onSetData and writeJSONObject', () => {
    instance.Name = 'test';
    instance.Comment = 'test';

    const jdata: DocumentTypeJson = instance.writeJSONObject();
    expect(jdata).toBeTruthy();
    expect(jdata.Name).toEqual('test');
    expect(jdata.Comment).toEqual('test');

    const instance2: DocumentType = new DocumentType();
    instance2.onSetData(jdata);
    expect(instance2.Name).toEqual(instance.Name);
    expect(instance2.Comment).toEqual(instance.Comment);
  });
});

describe('AssetCategory', () => {
  let instance: AssetCategory;

  beforeEach(() => {
    instance = new AssetCategory();
  });

  it('#0. onInit', () => {
    instance.Name = 'test';
    instance.Desp = 'test';

    instance.onInit();
    expect(instance.Name).toBeNull();
    expect(instance.Desp).toBeNull();
  });
  it('#1. onVerify: name is must', () => {
    instance.Desp = 'test';

    expect(instance.onVerify()).toBeFalsy();
  });
  it('#2. onVerify: valid case', () => {
    instance.Name = 'test';
    instance.Desp = 'test';

    expect(instance.onVerify()).toBeTruthy();
  });
  it('#3. onSetData and writeJSONObject', () => {
    instance.Name = 'test';
    instance.Desp = 'test';

    const jdata: AssetCategoryJson = instance.writeJSONObject();
    expect(jdata).toBeTruthy();
    expect(jdata.Name).toEqual('test');
    expect(jdata.Desp).toEqual('test');

    const instance2: AssetCategory = new AssetCategory();
    instance2.onSetData(jdata);
    expect(instance2.Name).toEqual(instance.Name);
    expect(instance2.Desp).toEqual(instance.Desp);
  });
});

describe('Account', () => {
  let instance: Account;

  beforeEach(() => {
    instance = new Account();
  });

  it('#1. onVerify: name is must', () => {
    instance.Comment = 'test';
    instance.CategoryId = 1;

    expect(instance.onVerify()).toBeFalsy();
  });
  it('#2. onVerify: category is must', () => {
    instance.Name = 'test';
    instance.Comment = 'test';

    expect(instance.onVerify()).toBeFalsy();
  });
  it('#3. onVerify: category shall be valid', () => {
    instance.Name = 'test';
    instance.Comment = 'test';
    instance.CategoryId = 11;

    expect(
      instance.onVerify({
        Categories: [
          {
            ID: 1,
            Name: 'Ctgy 1',
          } as AccountCategory,
          {
            ID: 2,
            Name: 'Ctgy 2',
          } as AccountCategory,
        ],
      } as IAccountVerifyContext)
    ).toBeFalsy();
  });

  it('onSetData and writeObject', () => {
    instance.Name = 'test';
    instance.Comment = 'test';

    const writeObj: AccountJson = instance.writeJSONObject();
    expect(writeObj).toBeTruthy();
  });
});

describe('AccountExtraAdvancePayment', () => {
  let instance: AccountExtraAdvancePayment;

  beforeEach(() => {
    instance = new AccountExtraAdvancePayment();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. default values', () => {
    expect(instance.StartDate).toBeTruthy();
    expect(instance.EndDate).toBeTruthy();
    expect(instance.StartDate.isBefore(instance.EndDate)).toEqual(true);
    expect(instance.Comment).toBeFalsy();
  });

  it('#2. onInit', () => {
    instance.onInit();

    expect(instance.StartDate).toBeTruthy();
    expect(instance.EndDate).toBeTruthy();
    expect(instance.StartDate.isBefore(instance.EndDate)).toEqual(true);
    expect(instance.Comment).toBeFalsy();
  });

  it('#3. frequence type is a must', () => {
    expect(instance.isValid).toEqual(false);

    instance.Comment = 'test';
    expect(instance.isValid).toEqual(false);
  });

  it('#4. comment is a must', () => {
    expect(instance.isValid).toEqual(false);

    instance.RepeatType = hih.RepeatFrequencyEnum.Month;
    expect(instance.isValid).toEqual(false);
  });

  it('#5. date range is a must', () => {
    expect(instance.isValid).toEqual(false);

    instance.RepeatType = hih.RepeatFrequencyEnum.Month;
    instance.Comment = 'test';
    instance.StartDate = instance.EndDate.add(1, 'y');
    expect(instance.isValid).toEqual(false);
  });

  it('#6. account valid case', () => {
    expect(instance.isValid).toEqual(false);

    instance.RepeatType = hih.RepeatFrequencyEnum.Month;
    instance.Comment = 'test';

    expect(instance.isAccountValid).toEqual(true);
    expect(instance.isValid).toEqual(false);
  });

  it('#7. valid case', () => {
    expect(instance.isValid).toEqual(false);

    instance.RepeatType = hih.RepeatFrequencyEnum.Month;
    instance.Comment = 'test';
    instance.dpTmpDocs.push({
      DocId: 1,
      AccountId: 1,
      TranType: 2,
      TranAmount: 100,
      ControlCenterId: 1,
      Desp: 'Test',
      TranDate: moment(),
    } as TemplateDocADP);

    expect(instance.isValid).toEqual(true);
  });

  it('#8. clone shall work', () => {
    expect(instance.isValid).toEqual(false);

    instance.RepeatType = hih.RepeatFrequencyEnum.Month;
    instance.Comment = 'test';

    const instance2: AccountExtraAdvancePayment = instance.clone();
    expect(instance2.Comment).toEqual(instance.Comment);
    expect(instance2.RepeatType).toEqual(instance.RepeatType);
    expect(instance.StartDate.isSame(instance2.StartDate)).toBeTruthy();
    expect(instance.EndDate.isSame(instance2.EndDate)).toBeTruthy();
  });

  it('#9. onSetData and writeObject shall work', () => {
    expect(instance.isValid).toEqual(false);

    instance.RepeatType = hih.RepeatFrequencyEnum.Month;
    instance.Comment = 'test';

    const jdata = instance.writeJSONObject();

    const instance2: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
    instance2.onSetData(jdata);
    expect(instance2.Comment).toEqual(instance.Comment);
    expect(instance2.RepeatType).toEqual(instance.RepeatType);
    expect(instance.StartDate.startOf('day').isSame(instance2.StartDate.startOf('day'))).toBeTruthy();
    expect(instance.EndDate.startOf('day').isSame(instance2.EndDate.startOf('day'))).toBeTruthy();
  });
});

describe('AccountExtraAsset', () => {
  let instance: AccountExtraAsset;

  beforeEach(() => {
    instance = new AccountExtraAsset();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. default values', () => {
    expect(instance.Name).toBeFalsy();
    expect(instance.CategoryID).toBeFalsy();
    expect(instance.Comment).toBeFalsy();
  });

  it('#2. onInit', () => {
    instance.onInit();

    expect(instance.Name).toBeFalsy();
    expect(instance.CategoryID).toBeFalsy();
    expect(instance.Comment).toBeFalsy();
  });
  it('#3. clone shall work', () => {
    const instance2 = instance.clone();
    expect(instance2).not.toBeFalsy();
  });
  it('#4. writeJSONObject and onSetData shall work', () => {
    instance.Name = 'test';
    instance.Comment = 'test';
    const dataJson = instance.writeJSONObject();

    expect(dataJson).not.toBeFalsy();
    const instance2: AccountExtraAsset = new AccountExtraAsset();
    instance2.onSetData(dataJson);
    expect(instance2).toBeTruthy();
  });
});

describe('AccountExtraLoan', () => {
  let instance: AccountExtraLoan;

  beforeEach(() => {
    instance = new AccountExtraLoan();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. default values', () => {
    expect(instance.startDate).not.toBeFalsy();
  });
  it('#2. onInit', () => {
    instance.onInit();

    expect(instance.startDate).not.toBeFalsy();
  });
  it('#3. clone shall work', () => {
    const instance2 = instance.clone();
    expect(instance2).not.toBeFalsy();
  });
  it('#4. writeJSONObject and onSetData shall work', () => {
    instance.Comment = 'test';
    instance.Partner = 'partner';
    instance.TotalMonths = 30;
    const dataJson = instance.writeJSONObject();
    expect(dataJson).not.toBeFalsy();
    const instance2: AccountExtraLoan = new AccountExtraLoan();
    instance2.onSetData(dataJson);
    expect(instance2).toBeTruthy();
  });
  xit('#5. isAccountValid', () => {
    expect(instance.isAccountValid).toBeFalsy();
    instance.InterestFree = true;
    instance.startDate = moment();
    instance.endDate = moment().subtract(1, 'd');
    expect(instance.isAccountValid).toBeFalsy();
    instance.endDate = moment().add(1, 'y');
    expect(instance.isAccountValid).toBeFalsy();
    instance.RepayMethod = RepaymentMethodEnum.EqualPrincipal;
    expect(instance.isAccountValid).toBeFalsy();
    instance.TotalMonths = 12;
    expect(instance.isAccountValid).toBeTruthy();
  });
});

describe('ControlCenter', () => {
  let instance: ControlCenter;

  beforeEach(() => {
    instance = new ControlCenter();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. default values', () => {
    expect(instance.Name).toBeFalsy();
  });
  it('#2. onInit', () => {
    instance.Name = 'Test';
    expect(instance.Name).toBeTruthy();
    instance.onInit();
    expect(instance.Name).toBeFalsy();
  });
  it('#3. writeJSONObject and onSetData shall work', () => {
    instance.Comment = 'test';
    instance.Name = 'test';

    const dataJson = instance.writeJSONObject();
    expect(dataJson).not.toBeFalsy();
    const instance2: ControlCenter = new ControlCenter();
    instance2.onSetData(dataJson);
    expect(instance2).toBeTruthy();
  });
  it('#4. onVerify', () => {
    const rst: boolean = instance.onVerify();
    expect(rst).toBeFalsy();
    expect(instance.VerifiedMsgs.length).toBeGreaterThan(0);
  });
});

describe('Order', () => {
  let instance: Order;
  let fakeData: FakeDataHelper;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildFinControlCenter();
  });

  beforeEach(() => {
    instance = new Order();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. default values', () => {
    expect(instance.ValidFrom).not.toBeFalsy();
    expect(instance.Name).toBeFalsy();
  });
  it('#2. onInit', () => {
    instance.Name = 'Test';
    expect(instance.Name).toBeTruthy();
    instance.onInit();
    expect(instance.Name).toBeFalsy();
  });
  it('#3. writeJSONObject and onSetData shall work', () => {
    instance.Comment = 'test';
    instance.Name = 'test';

    const dataJson = instance.writeJSONObject();
    expect(dataJson).not.toBeFalsy();
    const instance2: ControlCenter = new ControlCenter();
    instance2.onSetData(dataJson);
    expect(instance2).toBeTruthy();
  });
  it('#4. onVerify: name is must', () => {
    instance.Name = '';
    instance.SRules.push(new SettlementRule());

    const rst: boolean = instance.onVerify();
    expect(rst).toBeFalsy();

    const erridx: number = instance.VerifiedMsgs.findIndex((val: hih.InfoMessage) => {
      return val.MsgTitle === 'Common.NameIsMust';
    });
    expect(erridx).not.toEqual(-1);
  });
  it('#5. onVerify: valid from is must', () => {
    instance.Name = 'test';
    instance.ValidFrom = undefined;
    instance.SRules.push(new SettlementRule());

    const rst: boolean = instance.onVerify();
    expect(rst).toBeFalsy();

    const erridx: number = instance.VerifiedMsgs.findIndex((val: hih.InfoMessage) => {
      return val.MsgTitle === 'Common.InvalidValidFrom';
    });
    expect(erridx).not.toEqual(-1);
  });
  it('#6. onVerify: valid to is must', () => {
    instance.Name = 'test';
    instance.ValidTo = undefined;
    instance.SRules.push(new SettlementRule());

    const rst: boolean = instance.onVerify();
    expect(rst).toBeFalsy();

    const erridx: number = instance.VerifiedMsgs.findIndex((val: hih.InfoMessage) => {
      return val.MsgTitle === 'Common.InvalidValidTo';
    });
    expect(erridx).not.toEqual(-1);
  });
  it('#7. onVerify: valid from must earlier than valid to', () => {
    instance.Name = 'test';
    instance.ValidTo = instance.ValidFrom?.subtract(1, 'M');
    instance.SRules.push(new SettlementRule());

    const rst: boolean = instance.onVerify();
    expect(rst).toBeFalsy();

    const erridx: number = instance.VerifiedMsgs.findIndex((val: hih.InfoMessage) => {
      return val.MsgTitle === 'Common.InvalidValidRange';
    });
    expect(erridx).not.toEqual(-1);
  });
  it('#8. onVerify: settlement rule is must', () => {
    instance.Name = 'test';

    const rst: boolean = instance.onVerify();
    expect(rst).toBeFalsy();

    const erridx: number = instance.VerifiedMsgs.findIndex((val: hih.InfoMessage) => {
      return val.MsgContent === 'Finance.NoSettlementRule';
    });
    expect(erridx).not.toEqual(-1);
  });
  it('#9. onVerify: settlement rule ID shall not duplicate', () => {
    // Ref: https://github.com/alvachien/achihui/issues/245
    instance.Name = 'test';
    let srule: SettlementRule = new SettlementRule();
    srule.RuleId = 1;
    srule.ControlCenterId = fakeData.finControlCenters[0].Id;
    srule.Precent = 30;
    instance.SRules.push(srule);
    srule = new SettlementRule();
    srule.RuleId = 1;
    srule.ControlCenterId = fakeData.finControlCenters[1].Id;
    srule.Precent = 70;
    instance.SRules.push(srule);

    const rst: boolean = instance.onVerify();
    expect(rst).toBeFalsy();

    const erridx: number = instance.VerifiedMsgs.findIndex((val: hih.InfoMessage) => {
      return val.MsgContent === 'Common.DuplicatedID';
    });
    expect(erridx).not.toEqual(-1);
  });
  it('#10. onVerify: one control center shall not used in multiple settlement rules', () => {
    // Ref: https://github.com/alvachien/achihui/issues/249
    instance.Name = 'test';
    let srule: SettlementRule = new SettlementRule();
    srule.RuleId = 1;
    srule.ControlCenterId = fakeData.finControlCenters[0].Id;
    srule.Precent = 30;
    instance.SRules.push(srule);
    srule = new SettlementRule();
    srule.RuleId = 2;
    srule.ControlCenterId = fakeData.finControlCenters[0].Id;
    srule.Precent = 70;
    instance.SRules.push(srule);

    const rst: boolean = instance.onVerify();
    expect(rst).toBeFalsy();

    const erridx: number = instance.VerifiedMsgs.findIndex((val: hih.InfoMessage) => {
      return val.MsgContent === 'Common.DuplicatedID';
    });
    expect(erridx).not.toEqual(-1);
  });
});

describe('SettlementRule', () => {
  let instance: SettlementRule;

  beforeEach(() => {
    instance = new SettlementRule();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. default values', () => {
    expect(instance.VerifiedMsgs.length).toEqual(0);
  });
  it('#2. writeJSONObject and onSetData shall work', () => {
    instance.Comment = 'test';
    instance.Precent = 100;
    instance.RuleId = 1;
    instance.ControlCenterId = 1;

    const dataJson = instance.writeJSONObject();
    expect(dataJson).not.toBeFalsy();
    const instance2: SettlementRule = new SettlementRule();
    instance2.onSetData(dataJson);
    expect(instance2).toBeTruthy();
  });
  it('#4. onVerify', () => {
    instance.Precent = 101;
    const rst: boolean = instance.onVerify();
    expect(rst).toBeFalsy();
    expect(instance.VerifiedMsgs.length).toBeGreaterThan(0);
  });
});

describe('Document', () => {
  let instance: Document;
  let fakeData: FakeDataHelper;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrencies();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();
  });

  beforeEach(() => {
    instance = new Document();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. Default values', () => {
    expect(instance.VerifiedMsgs.length).toEqual(0);
    expect(instance.TranDate).toBeTruthy();
  });
  it('#2. onVerify: Doc type is a must', () => {
    instance.Id = 1;
    // instance.DocType = fakeData.finDocTypes[0].Id;
    instance.TranCurr = fakeData.chosedHome.BaseCurrency;
    instance.TranDate = moment();
    instance.Desp = 'test';

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.DocumentTypeIsMust';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#3. onVerify: Doc type should be valid', () => {
    instance.Id = 1;
    instance.DocType = 233; // Invalid one
    instance.TranCurr = fakeData.chosedHome.BaseCurrency;
    instance.TranDate = moment();
    instance.Desp = 'test';

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.InvalidDocumentType';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#4. onVerify: Doc type must be fetched', () => {
    instance.Id = 1;
    instance.DocType = fakeData.finDocTypes[0].Id ?? 0;
    instance.TranCurr = fakeData.chosedHome.BaseCurrency;
    instance.TranDate = moment();
    instance.Desp = 'test';

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: [],
      TransactionTypes: [],
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.DocumentTypeFetchFailed';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#5. onVerify: Desp is a must', () => {
    instance.Id = 1;
    instance.DocType = fakeData.finDocTypes[0].Id ?? 0;
    instance.TranCurr = fakeData.chosedHome.BaseCurrency;
    instance.TranDate = moment();
    // instance.Desp = 'test';

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.DespIsMust';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#6. onVerify: Desp larger than 44', () => {
    instance.Id = 1;
    instance.DocType = fakeData.finDocTypes[0].Id ?? 0;
    instance.TranCurr = fakeData.chosedHome.BaseCurrency;
    instance.TranDate = moment();
    instance.Desp = 'testttttttttttttttttttttttttttttttttttttttttttttttttt';

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.DespIsTooLong';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#7. onVerify: currency is a must', () => {
    instance.Id = 1;
    instance.DocType = fakeData.finDocTypes[0].Id ?? 0;
    // instance.TranCurr = fakeData.chosedHome.BaseCurrency;
    instance.TranDate = moment();
    instance.Desp = 'test';

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.CurrencyIsMust';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#8. onVerify: currency should be valid', () => {
    instance.Id = 1;
    instance.DocType = fakeData.finDocTypes[0].Id ?? 0;
    instance.TranCurr = 'DEM'; // Invalid currency
    instance.TranDate = moment();
    instance.Desp = 'test';

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.InvalidCurrency';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#9. onVerify: currency should be fetched', () => {
    instance.Id = 1;
    instance.DocType = fakeData.finDocTypes[0].Id ?? 0;
    instance.TranCurr = fakeData.chosedHome.BaseCurrency;
    instance.TranDate = moment();
    instance.Desp = 'test';

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: [],
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.CurrencyFetchFailed';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#10. onVerify: item ID shall not duplicated', () => {
    // Ref: https://github.com/alvachien/achihui/issues/244
    instance.Id = 1;
    instance.DocType = fakeData.finDocTypes[0].Id ?? 0;
    instance.TranCurr = fakeData.chosedHome.BaseCurrency;
    instance.TranDate = moment();
    instance.Desp = 'test';
    let di: DocumentItem = new DocumentItem();
    di.ItemId = 1;
    di.AccountId = fakeData.finAccounts[0].Id;
    di.ControlCenterId = fakeData.finControlCenters[0].Id;
    di.TranAmount = 100;
    di.Desp = 'Test 1';
    instance.Items.push(di);
    di = new DocumentItem();
    di.ItemId = 1;
    di.AccountId = fakeData.finAccounts[1].Id;
    di.ControlCenterId = fakeData.finControlCenters[0].Id;
    di.TranAmount = 100;
    di.Desp = 'Test 2';
    instance.Items.push(di);

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: [],
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Common.DuplicatedID';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#11. onVerify: amount shall be zero for currency exchange doc', () => {
    // Ref: https://github.com/alvachien/achihui/issues/260
    instance.HID = 1;
    instance.Id = 1;
    instance.DocType = financeDocTypeCurrencyExchange;
    instance.TranCurr = fakeData.chosedHome.BaseCurrency;
    instance.TranCurr2 = 'USD';
    instance.ExgRate2 = 673.11;
    instance.ExgRate_Plan2 = false;
    instance.TranDate = moment();
    instance.Desp = 'test';
    let di: DocumentItem = new DocumentItem();
    di.ItemId = 1;
    di.AccountId = fakeData.finAccounts[0].Id;
    di.ControlCenterId = fakeData.finControlCenters[0].Id;
    di.TranType = financeTranTypeTransferOut;
    di.TranAmount = 1009.67;
    di.Desp = 'Test 1';
    instance.Items.push(di);
    di = new DocumentItem();
    di.ItemId = 2;
    di.AccountId = fakeData.finAccounts[1].Id;
    di.ControlCenterId = fakeData.finControlCenters[0].Id;
    di.TranType = financeTranTypeTransferIn;
    di.TranAmount = 150;
    di.UseCurr2 = true;
    di.Desp = 'Test 2';
    instance.Items.push(di);

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeTruthy();
  });
});

describe('DocumentItem', () => {
  let instance: DocumentItem;
  let fakeData: FakeDataHelper;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrencies();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();
  });

  beforeEach(() => {
    instance = new DocumentItem();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. default values', () => {
    expect(instance.VerifiedMsgs.length).toEqual(0);
  });

  it('#3. writeJSONObject and onSetData shall work', () => {
    const dataJson = instance.writeJSONObject();
    expect(dataJson).not.toBeFalsy();
    const instance2: DocumentItem = new DocumentItem();
    instance2.onSetData(dataJson);
    expect(instance2).toBeTruthy();
  });
  it('#4. onVerify: Item Id is a must', () => {
    instance.AccountId = fakeData.finAccounts[0].Id;
    instance.ControlCenterId = fakeData.finControlCenters[0].Id;
    instance.Desp = 'test';
    instance.TranAmount = 100;
    instance.TranType = fakeData.finTranTypes[0].Id;

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();

    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.InvalidItemID';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#5. onVerify: Account Id is a must', () => {
    instance.ItemId = 1;
    // instance.AccountId = fakeData.finAccounts[0].Id;
    instance.ControlCenterId = fakeData.finControlCenters[0].Id;
    instance.Desp = 'test';
    instance.TranAmount = 100;
    instance.TranType = fakeData.finTranTypes[0].Id;

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.AccountIsMust';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#6. onVerify: Account Id must be exists', () => {
    instance.ItemId = 1;
    instance.AccountId = 30001; // Invalid account ID
    instance.ControlCenterId = fakeData.finControlCenters[0].Id;
    instance.Desp = 'test';
    instance.TranAmount = 100;
    instance.TranType = fakeData.finTranTypes[0].Id;

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.InvalidAccount';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#7. onVerify: Account status must be normal', () => {
    const arAccounts: Account[] = fakeData.finAccounts.slice();
    arAccounts[0].Status = AccountStatusEnum.Closed;
    instance.ItemId = 1;
    instance.AccountId = arAccounts[0].Id;
    instance.ControlCenterId = fakeData.finControlCenters[0].Id;
    instance.Desp = 'test';
    instance.TranAmount = 100;
    instance.TranType = fakeData.finTranTypes[0].Id;

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: arAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.InvalidAccount';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#8. onVerify: Account must be fetched for verifying', () => {
    instance.ItemId = 1;
    instance.AccountId = fakeData.finAccounts[0].Id;
    instance.ControlCenterId = fakeData.finControlCenters[0].Id;
    instance.Desp = 'test';
    instance.TranAmount = 100;
    instance.TranType = fakeData.finTranTypes[0].Id;

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: [],
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.AccountFetchFailed';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#9. onVerify: Tran type is a must', () => {
    instance.ItemId = 1;
    instance.AccountId = fakeData.finAccounts[0].Id;
    instance.ControlCenterId = fakeData.finControlCenters[0].Id;
    instance.Desp = 'test';
    instance.TranAmount = 100;
    // instance.TranType = fakeData.finTranTypes[0].Id;

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.TransactionTypeIsMust';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#10. onVerify: Tran type should be valid', () => {
    instance.ItemId = 1;
    instance.AccountId = fakeData.finAccounts[0].Id;
    instance.ControlCenterId = fakeData.finControlCenters[0].Id;
    instance.Desp = 'test';
    instance.TranAmount = 100;
    instance.TranType = 32323; // Invalid one

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.InvalidTransactionType';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#11. onVerify: Tran type must be fetched', () => {
    instance.ItemId = 1;
    instance.AccountId = fakeData.finAccounts[0].Id;
    instance.ControlCenterId = fakeData.finControlCenters[0].Id;
    instance.Desp = 'test';
    instance.TranAmount = 100;
    instance.TranType = fakeData.finTranTypes[0].Id; // Invalid one

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: [],
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.TransactionTypeFetchFailed';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#12. onVerify: Tran amount must larger than 0', () => {
    instance.ItemId = 1;
    instance.AccountId = fakeData.finAccounts[0].Id;
    instance.ControlCenterId = fakeData.finControlCenters[0].Id;
    instance.Desp = 'test';
    // instance.TranAmount = 100;
    instance.TranType = fakeData.finTranTypes[0].Id; // Invalid one

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.AmountIsNotCorrect';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#13. onVerify: Desp is must', () => {
    instance.ItemId = 1;
    instance.AccountId = fakeData.finAccounts[0].Id;
    instance.ControlCenterId = fakeData.finControlCenters[0].Id;
    // instance.Desp = 'test';
    instance.TranAmount = 100;
    instance.TranType = fakeData.finTranTypes[0].Id; // Invalid one

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.DespIsMust';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#14. onVerify: Desp is max to 44', () => {
    instance.ItemId = 1;
    instance.AccountId = fakeData.finAccounts[0].Id;
    instance.ControlCenterId = fakeData.finControlCenters[0].Id;
    instance.Desp = 'testtttttttttttttttttttttttttttttttttttttttttttttttt';
    instance.TranAmount = 100;
    instance.TranType = fakeData.finTranTypes[0].Id; // Invalid one

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.DespIsTooLong';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#15. onVerify: control center and order not allow assign both', () => {
    instance.ItemId = 1;
    instance.AccountId = fakeData.finAccounts[0].Id;
    instance.ControlCenterId = fakeData.finControlCenters[0].Id;
    instance.OrderId = fakeData.finOrders[0].Id;
    instance.Desp = 'test';
    instance.TranAmount = 100;
    instance.TranType = fakeData.finTranTypes[0].Id; // Invalid one

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.DualInputFound';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#16. onVerify: control center and order not allow no assign', () => {
    instance.ItemId = 1;
    instance.AccountId = fakeData.finAccounts[0].Id;
    // instance.ControlCenterId = fakeData.finControlCenters[0].Id;
    // instance.OrderId = fakeData.finOrders[0].Id;
    instance.Desp = 'test';
    instance.TranAmount = 100;
    instance.TranType = fakeData.finTranTypes[0].Id; // Invalid one

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.NoInputFound';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#17. onVerify: control center shall be valid', () => {
    instance.ItemId = 1;
    instance.AccountId = fakeData.finAccounts[0].Id;
    instance.ControlCenterId = 33331;
    // instance.OrderId = fakeData.finOrders[0].Id;
    instance.Desp = 'test';
    instance.TranAmount = 100;
    instance.TranType = fakeData.finTranTypes[0].Id; // Invalid one

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.InvalidControlCenter';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#18. onVerify: order shall be valid', () => {
    instance.ItemId = 1;
    instance.AccountId = fakeData.finAccounts[0].Id;
    // instance.ControlCenterId = 33331;
    instance.OrderId = 33331;
    instance.Desp = 'test';
    instance.TranAmount = 100;
    instance.TranType = fakeData.finTranTypes[0].Id; // Invalid one

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.InvalidActivity';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#19. onVerify: control center shall be fetched', () => {
    instance.ItemId = 1;
    instance.AccountId = fakeData.finAccounts[0].Id;
    instance.ControlCenterId = fakeData.finControlCenters[0].Id;
    // instance.OrderId = fakeData.finOrders[0].Id;
    instance.Desp = 'test';
    instance.TranAmount = 100;
    instance.TranType = fakeData.finTranTypes[0].Id; // Invalid one

    const rst: boolean = instance.onVerify({
      ControlCenters: [],
      Orders: fakeData.finOrders,
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.ControlCenterFetchFailedOrNoCC';
    });
    expect(idx).not.toEqual(-1);
  });
  it('#20. onVerify: order shall be fetched', () => {
    instance.ItemId = 1;
    instance.AccountId = fakeData.finAccounts[0].Id;
    instance.OrderId = fakeData.finOrders[0].Id; // Invalid one
    instance.Desp = 'test';
    instance.TranAmount = 100;
    instance.TranType = fakeData.finTranTypes[0].Id;

    const rst: boolean = instance.onVerify({
      ControlCenters: fakeData.finControlCenters,
      Orders: [],
      Accounts: fakeData.finAccounts,
      DocumentTypes: fakeData.finDocTypes,
      TransactionTypes: fakeData.finTranTypes,
      Currencies: fakeData.currencies,
      BaseCurrency: fakeData.chosedHome.BaseCurrency,
    });

    expect(rst).toBeFalsy();
    const idx: number = instance.VerifiedMsgs.findIndex((msg: hih.InfoMessage) => {
      return msg.MsgTitle === 'Finance.ActivityFetchFailedOrNoActivity';
    });
    expect(idx).not.toEqual(-1);
  });
});

describe('TemplateDocLoan', () => {
  let instance: TemplateDocLoan;

  beforeEach(() => {
    instance = new TemplateDocLoan();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. default values', () => {
    expect(instance.VerifiedMsgs.length).toEqual(0);
  });

  it('#3. writeJSONObject and onSetData shall work', () => {
    const dataJson = instance.writeJSONObject();
    expect(dataJson).not.toBeFalsy();
    const instance2: TemplateDocLoan = new TemplateDocLoan();
    instance2.onSetData(dataJson);
    expect(instance2).toBeTruthy();
  });
});

describe('Plan', () => {
  let instance: Plan;

  beforeEach(() => {
    instance = new Plan();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#1. default values', () => {
    expect(instance.VerifiedMsgs.length).toEqual(0);
  });

  it('#3. writeJSONObject and onSetData shall work', () => {
    const dataJson = instance.writeJSONObject();
    expect(dataJson).not.toBeFalsy();
    // let instance2: Plan = new Plan();
    // instance2.onSetData(dataJson);
    // expect(instance2).toBeTruthy();
  });
});

describe('FinanceNormalDocItemMassCreate', () => {
  let objtbt: FinanceNormalDocItemMassCreate;

  beforeEach(() => {
    objtbt = new FinanceNormalDocItemMassCreate();
  });

  it('isValid', () => {
    let vrst = objtbt.isValid;
    expect(vrst).toBeFalse();

    objtbt.desp = 'test';
    vrst = objtbt.isValid;
    expect(vrst).toBeFalse();

    objtbt.accountID = 2;
    vrst = objtbt.isValid;
    expect(vrst).toBeFalse();

    objtbt.tranType = 21;
    vrst = objtbt.isValid;
    expect(vrst).toBeFalse();

    objtbt.tranAmount = 213;
    vrst = objtbt.isValid;
    expect(vrst).toBeFalse();

    objtbt.tranCurrency = 'USD';
    vrst = objtbt.isValid;
    expect(vrst).toBeFalse();

    objtbt.controlCenterID = 123;
    vrst = objtbt.isValid;
    expect(vrst).toBeTrue();

    objtbt.orderID = 123;
    vrst = objtbt.isValid;
    expect(vrst).toBeFalse();
  });
});

describe('FinanceReportBase', () => {
  let instance: FinanceReportBase;

  beforeEach(() => {
    instance = new FinanceReportBase();
  });

  afterEach(() => {
    // Do nothing here
  });

  it('#3. writeJSONObject and onSetData shall work', () => {
    const dataJson = {};

    const instance2: FinanceReportBase = new FinanceReportBase();
    instance2.onSetData(dataJson);
    expect(instance2).toBeTruthy();
  });
});

describe('FinanceOverviewKeyfigure', () => {
  let objtbt: FinanceOverviewKeyfigure;

  beforeEach(() => {
    objtbt = new FinanceOverviewKeyfigure();
  });
  afterEach(() => {
    // Do nothing now.
  });
  it('#1. onSetData', () => {
    objtbt.onSetData({
      HomeID: 1,
      Currency: 'CNY',
      CurrentMonthIncome: 100,
      CurrentMonthOutgo: 20,
      LastMonthIncome: 90,
      LastMonthOutgo: 50,
      IncomeYTD: 1500,
      OutgoYTD: 300,
      CurrentMonthIncomePrecentage: 0.3,
      CurrentMonthOutgoPrecentage: 0.2,
    });
    expect(objtbt.BaseCurrency).toEqual('CNY');
    expect(objtbt.CurrentMonthOutgo).toEqual(20);
    expect(objtbt.OutgoYTD).toEqual(300);
  });
});

describe('FinanceReportEntryByAccountAndExpense', () => {
  let objtbt: FinanceReportEntryByAccountAndExpense;

  beforeEach(() => {
    objtbt = new FinanceReportEntryByAccountAndExpense();
  });
  afterEach(() => {
    // do nothing now.
  });
  it('#1. onSetData', () => {
    objtbt.onSetData({
      HomeID: 1,
      AccountID: 2,
      IsExpense: false,
      Balance: 100,
    });
    expect(objtbt.IsExpense).toBeFalse();
    expect(objtbt.Balance).toEqual(100);
  });
});

describe('FinanceReportEntryByTransactionTypeMoM', () => {
  let objtbt: FinanceReportEntryByTransactionTypeMoM;

  beforeEach(() => {
    objtbt = new FinanceReportEntryByTransactionTypeMoM();
  });
  afterEach(() => {
    // do nothing now.
  });
  it('#1. onSetData', () => {
    expect(objtbt).toBeTruthy();
    objtbt.onSetData({
      Month: 2,
      TransactionType: 1,
      TransactionTypeName: 'Test',
      HomeID: 2,
      InAmount: 100,
      OutAmount: 50,
    });
    expect(objtbt.OutAmount).toEqual(50);
    expect(objtbt.Month).toEqual(2);
  });
});

describe('FinanceReportEntryPerDate', () => {
  let objtbt: FinanceReportEntryPerDate;

  beforeEach(() => {
    objtbt = new FinanceReportEntryPerDate();
  });

  it('onSetData', () => {
    objtbt.onSetData({
      HomeID: 2,
      InAmount: 100,
      OutAmount: 50,
      TransactionDate: '2022-07-01',
    });
    expect(objtbt.transactionDate).toBeTruthy();
    expect(objtbt.InAmount).toEqual(100);
  });
});

describe('FinanceReportEntryMoM', () => {
  let objtbt: FinanceReportEntryMoM;

  beforeEach(() => {
    objtbt = new FinanceReportEntryMoM();
  });

  it('onSetData', () => {
    objtbt.onSetData({
      HomeID: 2,
      InAmount: 300,
      OutAmount: 50,
      Month: 7,
    });
    expect(objtbt.Month).toEqual(7);
    expect(objtbt.InAmount).toEqual(300);
  });
});

describe('FinanceDocumentMassCreateConfirm', () => {
  let objtbt: FinanceDocumentMassCreateConfirm;

  beforeEach(() => {
    objtbt = new FinanceDocumentMassCreateConfirm();
  });

  it('shall be create', () => {
    expect(objtbt).toBeTruthy();
    expect(objtbt.listDocByDate.length).toEqual(0);
  });
});

describe('DocumentCreatedFrequenciesByUser', () => {
  let objtbt: DocumentCreatedFrequenciesByUser;

  beforeEach(() => {
    objtbt = new DocumentCreatedFrequenciesByUser();
  });

  it('onSetData', () => {
    objtbt.onSetData({
      userID: 'test1',
      year: 2022,
      month: 8,
      week: 24,
      amountOfDocuments: 20,
    });
    expect(objtbt.userID).toEqual('test1');
    expect(objtbt.year).toEqual(2022);
  });
});

describe('DocumentWithPlanExgRateForUpdate', () => {
  let objtbt: DocumentWithPlanExgRateForUpdate;

  beforeEach(() => {
    objtbt = new DocumentWithPlanExgRateForUpdate();
  });

  it('it shall be created', () => {
    objtbt.hid = 1;
    objtbt.targetCurrency = 'USD';
    objtbt.exchangeRate = 1;
    expect(objtbt).toBeTruthy();
  });
});

describe('DocumentWithPlanExgRate', () => {
  let objtbt: DocumentWithPlanExgRate;

  beforeEach(() => {
    objtbt = new DocumentWithPlanExgRate();
  });

  it('onSetData', () => {
    objtbt.onSetData({
      hid: 2,
      docID: 22,
      docType: 23,
      tranDate: '2022-07-03',
      desp: 'test',
      tranCurr: 'USD',
      exgRate: 2.3,
      exgRate_Plan: true,
      tranCurr2: 'CNY',
      exgRate_Plan2: true,
    });
    expect(objtbt.Desp).toEqual('test');
    expect(objtbt.TranDateDisplayString).toEqual('2022-07-03');
  });
});

describe('DocumentItemWithBalance', () => {
  let objtbt: DocumentItemWithBalance;

  beforeEach(() => {
    objtbt = new DocumentItemWithBalance();
  });

  it('onSetData', () => {
    objtbt.onSetData({
      accountID: 12,
      tranType_Exp: true,
      tranCurr: 'CNY',
      tranAmount_Org: 200,
      tranAmount_LC: 200,
      balance: 300,
      tranTypeName: 'test',
      controlCenterName: 'test1',
      orderName: '',
      tranDate: '2022-07-01',
      docDesp: 'test',
      docID: 12,
      itemID: 3,
      tranType: 12,
      desp: 'test',
    });
    expect(objtbt.TranDate).toBeTruthy();
    expect(objtbt.TranDateFormatString).toEqual('2022-07-01');
  });
});

describe('ReportTrendExData', () => {
  let objtbt: ReportTrendExData;

  beforeEach(() => {
    objtbt = new ReportTrendExData();
  });

  it('onSetData', () => {
    objtbt.onSetData({
      tranDate: '2022-07-01',
      tranWeek: 34,
      tranMonth: 7,
      tranYear: 2022,
      expense: true,
      tranAmount: 200,
    });
    expect(objtbt.tranAmount).toEqual(200);
  });
});

describe('MonthOnMonthReport', () => {
  let objtbt: MonthOnMonthReport;

  beforeEach(() => {
    objtbt = new MonthOnMonthReport();
  });

  it('onSetData', () => {
    objtbt.onSetData({
      year: 2022,
      month: 8,
      expense: true,
      tranAmount: 330,
    });
    expect(objtbt.tranAmount).toEqual(330);
  });
});

describe('TranTypeReport', () => {
  let objtbt: TranTypeReport;

  beforeEach(() => {
    objtbt = new TranTypeReport();
  });

  it('onSetData', () => {
    objtbt.onSetData({
      tranType: 24,
      name: 'Test',
      expenseFlag: true,
      tranDate: '2022-07-09',
      tranAmount: 330,
    });
    expect(objtbt.TranAmount).toEqual(330);
    expect(objtbt.ExpenseFlag).toBeTrue();
    expect(objtbt.TranTypeName).toEqual('Test');
    expect(objtbt.TranType).toEqual(24);
  });
});

describe('FinanceReportByAccount', () => {
  let objtbt: FinanceReportByAccount;

  beforeEach(() => {
    objtbt = new FinanceReportByAccount();
  });

  it('onSetData', () => {
    objtbt.onSetData({
      AccountId: 24,
      DebiteBalance: 200,
      CreditBalance: 100,
      Balance: 100,
    });
    expect(objtbt.Balance).toEqual(100);
  });
});

describe('BalanceSheetReport', () => {
  let objtbt: BalanceSheetReport;

  beforeEach(() => {
    objtbt = new BalanceSheetReport();
  });

  it('onSetData', () => {
    objtbt.onSetData({
      accountID: 24,
      DebiteBalance: 200,
      CreditBalance: 100,
      Balance: 100,
      accountName: 'test',
      accountCategoryID: 1,
      accountCategoryName: 'Cash',
    });
    expect(objtbt.AccountId).toEqual(24);
    expect(objtbt.AccountName).toEqual('test');
    expect(objtbt.AccountCategoryId).toEqual(1);
    expect(objtbt.AccountCategoryName).toEqual('Cash');
  });
});
