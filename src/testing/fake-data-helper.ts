import {
  Currency,
  HomeDef,
  HomeMember,
  HomeMemberRelationEnum,
  DocumentType,
  AccountCategory,
  TranType,
  AssetCategory,
  Account,
  AccountJson,
  UserAuthInfo,
  AppLanguage,
  CurrencyJson,
  AppLanguageJson,
  DocumentTypeJson,
  AccountCategoryJson,
  TranTypeJson,
  AssetCategoryJson,
  BookCategory,
  Tag,
  TagJson,
  TagTypeEnum,
  TagCount,
  AccountStatusEnum,
  financeAccountCategoryCash,
  financeAccountCategoryCreditCard,
  ControlCenter,
  ControlCenterJson,
  Order,
  OrderJson,
  Plan,
  PlanTypeEnum,
  Document,
  DocumentItem,
  AccountExtraAdvancePayment,
  RepeatFrequencyEnum,
  TemplateDocADP,
  financeDocTypeAdvancePayment,
  FinanceAssetBuyinDocumentAPI,
  AccountExtraAsset,
  FinanceAssetSoldoutDocumentAPI,
  momentDateFormat,
  financeAccountCategoryAsset,
  FinanceAssetValChgDocumentAPI,
  financeAccountCategoryBorrowFrom,
  AccountExtraLoan,
  RepaymentMethodEnum,
  TemplateDocLoan,
  financeAccountCategoryLendTo,
  financeAccountCategoryAdvancePayment,
  SettlementRule,
  financeDocTypeNormal,
  financeTranTypeInterestOut,
  BlogCollection,
  BlogCollectionAPIJson,
  BlogPostAPIJson,
  BlogPost,
  PersonRole,
  OrganizationType,
} from '../app/model';
import * as moment from 'moment';

export class FakeDataHelper {
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
  private _currencies: Currency[] = [];
  private _currenciesFromAPI: CurrencyJson[] = [];
  private _chosedHome: HomeDef = new HomeDef();
  private _homeDefs: HomeDef[] = [];
  private _finDocTypes: DocumentType[] = [];
  private _finDocTypesFromAPI: DocumentTypeJson[] = [];
  private _finAccountCategories: AccountCategory[] = [];
  private _finAccountCategoriesFromAPI: AccountCategoryJson[] = [];
  private _finTranType: TranType[] = [];
  private _finTranTypeFromAPI: TranTypeJson[] = [];
  private _finAssetCategories: AssetCategory[] = [];
  private _finAssetCategoriesFromAPI: AssetCategoryJson[] = [];
  private _finAccounts: Account[] = [];
  private _finAccountsFromAPI: AccountJson[] = [];
  private _finAccountExtraAdvancePayment: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
  private _finControlCenters: ControlCenter[] = [];
  private _finControlCentersFromAPI: ControlCenterJson[] = [];
  private _finOrders: Order[] = [];
  private _finOrdersFromAPI: OrderJson[] = [];
  private _finPlans: Plan[] = [];
  private _finNormalDocumentForCreate: Document = new Document();
  private _finTransferDocumentForCreate: Document = new Document();
  private _finADPDocumentForCreate: Document = new Document();
  private _currUser: UserAuthInfo = new UserAuthInfo();
  private _appLanguages: AppLanguage[] = [];
  private _appLanguagesFromAPI: AppLanguageJson[] = [];
  private _libBookCategories: BookCategory[] = [];
  private _tags: Tag[] = [];
  private _tagsFromAPI: TagJson[] = [];
  private _tagsCount: TagCount[] = [];
  private _blogCollectionAPI: BlogCollectionAPIJson[] = [];
  private _blogCollection: BlogCollection[] = [];
  private _blogPostAPI: BlogPostAPIJson[] = [];
  private _blogPost: BlogPost[] = [];
  private _personRoles: PersonRole[] = [];
  private _organizationTypes: OrganizationType[] = [];

  readonly userID1: string = 'abcdefg';
  readonly userID1Sub: string = '12345abcdefg';

  constructor() {
    // Empty
  }

  get currencies(): Currency[] {
    return this._currencies;
  }
  get currenciesFromAPI(): CurrencyJson[] {
    return this._currenciesFromAPI;
  }
  get HomeDefs(): HomeDef[] {
    return this._homeDefs;
  }
  get chosedHome(): HomeDef {
    return this._chosedHome;
  }
  get finDocTypes(): DocumentType[] {
    return this._finDocTypes;
  }
  get finDocTypesFromAPI(): DocumentTypeJson[] {
    if (this._finDocTypesFromAPI) {
      return this._finDocTypesFromAPI;
    }
    return [];
  }
  get finAccountCategories(): AccountCategory[] {
    if (this._finAccountCategories) {
      return this._finAccountCategories;
    }
    return [];
  }
  get finAccountCategoriesFromAPI(): AccountCategoryJson[] {
    if (this._finAccountCategoriesFromAPI) {
      return this._finAccountCategoriesFromAPI;
    }
    return [];
  }
  get finAssetCategories(): AssetCategory[] {
    if (this._finAssetCategories) {
      return this._finAssetCategories;
    }
    return [];
  }
  get finAssetCategoriesFromAPI(): AssetCategoryJson[] {
    if (this._finAssetCategoriesFromAPI) {
      return this._finAssetCategoriesFromAPI;
    }
    return [];
  }
  get finTranTypes(): TranType[] {
    if (this._finTranType) {
      return this._finTranType;
    }
    return [];
  }
  get finTranTypesFromAPI(): TranTypeJson[] {
    if (this._finTranTypeFromAPI) {
      return this._finTranTypeFromAPI;
    }
    return [];
  }
  get finTranTypeTopNodeAmount(): number {
    if (this._finTranType) {
      return this._finTranType.filter((val: TranType) => {
        return val.ParId === undefined;
      }).length;
    }
    return 0;
  }
  get finAccounts(): Account[] {
    if (this._finAccounts) {
      return this._finAccounts;
    }
    return [];
  }
  get finAccountsFromAPI(): AccountJson[] {
    if (this._finAccountsFromAPI) {
      return this._finAccountsFromAPI;
    }
    return [];
  }
  get finAccountExtraAdvancePayment(): AccountExtraAdvancePayment {
    return this._finAccountExtraAdvancePayment;
  }
  get finControlCenters(): ControlCenter[] {
    if (this._finControlCenters) {
      return this._finControlCenters;
    }
    return [];
  }
  get finControlCentersFromAPI(): ControlCenterJson[] {
    if (this._finControlCentersFromAPI) {
      return this._finControlCentersFromAPI;
    }
    return [];
  }
  get finOrders(): Order[] {
    if (this._finOrders) {
      return this._finOrders;
    }
    return [];
  }
  get finOrdersFromAPI(): OrderJson[] {
    if (this._finOrdersFromAPI) {
      return this._finOrdersFromAPI;
    }
    return [];
  }
  get finPlans(): Plan[] {
    if (this._finPlans) {
      return this._finPlans;
    }
    return [];
  }
  get finNormalDocumentForCreate(): Document {
    return this._finNormalDocumentForCreate;
  }
  get finTransferDocumentForCreate(): Document {
    return this._finTransferDocumentForCreate;
  }
  get finADPDocumentForCreate(): Document {
    return this._finADPDocumentForCreate;
  }
  get currentUser(): UserAuthInfo {
    return this._currUser;
  }
  get appLanguages(): AppLanguage[] {
    if (this._appLanguages) {
      return this._appLanguages;
    }
    return [];
  }
  get appLanguagesFromAPI(): any[] {
    if (this._appLanguagesFromAPI) {
      return this._appLanguagesFromAPI;
    }
    return [];
  }
  get libBookCategories(): BookCategory[] {
    if (this._libBookCategories) {
      return this._libBookCategories;
    }
    return [];
  }
  get tags(): Tag[] {
    if (this._tags) {
      return this._tags;
    }
    return [];
  }
  get tagsFromAPI(): TagJson[] {
    if (this._tagsFromAPI) {
      return this._tagsFromAPI;
    }
    return [];
  }
  get tagsCount(): TagCount[] {
    if (this._tagsCount) {
      return this._tagsCount;
    }
    return [];
  }
  get blogCollectionAPI(): BlogCollectionAPIJson[] {
    return this._blogCollectionAPI;
  }
  get blogCollection(): BlogCollection[] {
    return this._blogCollection;
  }
  get blogPostAPI(): BlogPostAPIJson[] {
    return this._blogPostAPI;
  }
  get blogPost(): BlogPost[] {
    return this._blogPost;
  }
  get personRoles(): PersonRole[] {
    return this._personRoles;
  }
  get organizationTypes(): OrganizationType[] {
    return this._organizationTypes;
  }

  public buildCurrencies(): void {
    this._currencies = [];
    let curr: Currency = new Currency();
    curr.Name = 'Chinese Yuan';
    curr.Symbol = '￥';
    curr.Currency = 'CNY';
    this._currencies.push(curr);

    curr = new Currency();
    curr.Name = 'US Dollar';
    curr.Symbol = '$';
    curr.Currency = 'USD';
    this._currencies.push(curr);

    curr = new Currency();
    curr.Name = 'Euro';
    curr.Symbol = 'E';
    curr.Currency = 'EUR';
    this._currencies.push(curr);
  }
  public buildCurrenciesFromAPI(): void {
    this._currenciesFromAPI = [];
    const curr: CurrencyJson = {
      Name: 'Chinese Yuan',
      Symbol: '#',
      Curr: 'CNY',
    };
    this._currenciesFromAPI.push(curr);
    const curr2: CurrencyJson = {
      Name: 'US Dollar',
      Symbol: '$',
      Curr: 'USD',
    };
    this._currenciesFromAPI.push(curr2);
  }
  public buildChosedHome(): void {
    this._chosedHome = new HomeDef();
    this._chosedHome.ID = 2;
    this._chosedHome.Name = 'Home for UT';
    this._chosedHome.BaseCurrency = 'CNY';
    // this._chosedHome.CreatorDisplayAs = 'Creator in Home for UT';
    this._chosedHome.Host = this.userID1;
    const hmem: HomeMember = new HomeMember();
    hmem.HomeID = this._chosedHome.ID;
    hmem.User = this._chosedHome.Host;
    hmem.Relation = HomeMemberRelationEnum.Self;
    hmem.DisplayAs = 'Creator in Home';
    hmem.IsChild = false;
    this._chosedHome.Members.push(hmem);
  }
  public buildHomeDefs(): void {
    this._homeDefs = [];
    if (this._chosedHome) {
      this._homeDefs.push(this._chosedHome);
    }
    const def: HomeDef = new HomeDef();
    def.ID = 3;
    def.Name = 'Second Home for UT';
    def.BaseCurrency = 'USD';
    // def.CreatorDisplayAs = 'Creator';
    def.Host = this.userID1;
    this._homeDefs.push(def);
  }
  public buildFinConfigData(): void {
    // Doc type
    this._finDocTypes = [];
    let docType: DocumentType = new DocumentType();
    docType.Id = 1;
    docType.Name = 'Sys.DocTy.Normal';
    docType.Comment = 'Normal';
    this._finDocTypes.push(docType);
    docType = new DocumentType();
    docType.Id = 2;
    docType.Name = 'Sys.DocTy.Transfer';
    docType.Comment = 'Transfer';
    this._finDocTypes.push(docType);
    docType = new DocumentType();
    docType.Id = 3;
    docType.Name = 'Sys.DocTy.CurrExg';
    docType.Comment = 'CurrExg';
    this._finDocTypes.push(docType);
    docType = new DocumentType();
    docType.Id = 5;
    docType.Name = 'Sys.DocTy.AdvancedPayment';
    docType.Comment = 'AdvancedPayment';
    this._finDocTypes.push(docType);
    docType = new DocumentType();
    docType.Id = 7;
    docType.Name = 'Sys.DocTy.AssetBuyIn';
    docType.Comment = 'AssetBuyIn';
    this._finDocTypes.push(docType);
    docType = new DocumentType();
    docType.Id = 8;
    docType.Name = 'Sys.DocTy.AssetSoldOut';
    docType.Comment = 'AssetSoldOut';
    this._finDocTypes.push(docType);
    docType = new DocumentType();
    docType.Id = 9;
    docType.Name = 'Sys.DocTy.BorrowFrom';
    docType.Comment = 'BorrowFrom';
    this._finDocTypes.push(docType);
    docType = new DocumentType();
    docType.Id = 10;
    docType.Name = 'Sys.DocTy.LendTo';
    docType.Comment = 'LendTo';
    this._finDocTypes.push(docType);
    docType = new DocumentType();
    docType.Id = 11;
    docType.Name = 'Sys.DocTy.Repay';
    docType.Comment = 'Repay';
    this._finDocTypes.push(docType);
    docType = new DocumentType();
    docType.Id = 12;
    docType.Name = 'Sys.DocTy.AdvancedRecv';
    docType.Comment = 'AdvancedRecv';
    this._finDocTypes.push(docType);
    docType = new DocumentType();
    docType.Id = 13;
    docType.Name = 'Sys.DocTy.AssetValChg';
    docType.Comment = 'AssetValChg';
    this._finDocTypes.push(docType);
    docType = new DocumentType();
    docType.Id = 14;
    docType.Name = 'Sys.DocTy.Insurance';
    docType.Comment = 'Insurance';
    this._finDocTypes.push(docType);

    // Tran. type
    this._finTranType = [];
    let tranType: TranType = new TranType();
    tranType.Id = 1;
    tranType.Name = '初始资金';
    tranType.Expense = false;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 2;
    tranType.Name = '主业收入';
    tranType.Expense = false;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 3;
    tranType.Name = '工资';
    tranType.ParId = 2;
    tranType.Expense = false;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 4;
    tranType.Name = '奖金';
    tranType.ParId = 2;
    tranType.Expense = false;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 35;
    tranType.Name = '津贴';
    tranType.ParId = 2;
    tranType.Expense = false;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 5;
    tranType.Name = '投资、保险、博彩类收入';
    tranType.Expense = false;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 6;
    tranType.Name = '股票收益';
    tranType.ParId = 5;
    tranType.Expense = false;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 7;
    tranType.Name = '基金类收益';
    tranType.ParId = 5;
    tranType.Expense = false;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 8;
    tranType.Name = '银行利息收入';
    tranType.ParId = 5;
    tranType.Expense = false;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 13;
    tranType.Name = '彩票中奖类收益';
    tranType.ParId = 5;
    tranType.Expense = false;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 36;
    tranType.Name = '保险报销收入';
    tranType.ParId = 5;
    tranType.Expense = false;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 87;
    tranType.Name = '借贷还款收入';
    tranType.ParId = 5;
    tranType.Expense = false;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 90;
    tranType.Name = '资产增值';
    tranType.ParId = 5;
    tranType.Expense = false;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 93;
    tranType.Name = '资产出售收益';
    tranType.ParId = 5;
    tranType.Expense = false;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 10;
    tranType.Name = '其它收入';
    tranType.Expense = false;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 37;
    tranType.Name = '转账收入';
    tranType.ParId = 10;
    tranType.Expense = false;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 80;
    tranType.Name = '贷款入账';
    tranType.ParId = 10;
    tranType.Expense = false;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 91;
    tranType.Name = '预收款收入';
    tranType.ParId = 10;
    tranType.Expense = false;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 30;
    tranType.Name = '人情交往类';
    tranType.Expense = false;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 33;
    tranType.Name = '红包收入';
    tranType.Expense = true;
    tranType.ParId = 30;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 9;
    tranType.Name = '生活类开支';
    tranType.Expense = true;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 11;
    tranType.Name = '物业类支出';
    tranType.ParId = 9;
    tranType.Expense = true;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 14;
    tranType.Name = '小区物业费';
    tranType.Expense = true;
    tranType.ParId = 11;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 15;
    tranType.Name = '水费';
    tranType.Expense = true;
    tranType.ParId = 11;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 16;
    tranType.Name = '电费';
    tranType.Expense = true;
    tranType.ParId = 11;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 17;
    tranType.Name = '天然气费用';
    tranType.Expense = true;
    tranType.ParId = 11;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 18;
    tranType.Name = '物业维修费';
    tranType.Expense = true;
    tranType.ParId = 11;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 26;
    tranType.Name = '通讯费';
    tranType.ParId = 9;
    tranType.Expense = true;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 27;
    tranType.Name = '固定电话/宽带';
    tranType.Expense = true;
    tranType.ParId = 26;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 28;
    tranType.Name = '手机费';
    tranType.Expense = true;
    tranType.ParId = 26;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 38;
    tranType.Name = '衣服饰品';
    tranType.ParId = 9;
    tranType.Expense = true;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 39;
    tranType.Name = '食品酒水';
    tranType.ParId = 9;
    tranType.Expense = true;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 49;
    tranType.Name = '休闲娱乐';
    tranType.ParId = 9;
    tranType.Expense = true;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 54;
    tranType.Name = '学习进修';
    tranType.Expense = true;
    tranType.ParId = 9;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 61;
    tranType.Name = '日常用品';
    tranType.Expense = true;
    tranType.ParId = 9;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 12;
    tranType.Name = '私家车支出';
    tranType.Expense = true;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 19;
    tranType.Name = '车辆保养';
    tranType.Expense = true;
    tranType.ParId = 12;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 20;
    tranType.Name = '汽油费';
    tranType.Expense = true;
    tranType.ParId = 12;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 21;
    tranType.Name = '车辆保险费';
    tranType.Expense = true;
    tranType.ParId = 12;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 22;
    tranType.Name = '停车费';
    tranType.Expense = true;
    tranType.ParId = 12;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 23;
    tranType.Name = '车辆维修';
    tranType.Expense = true;
    tranType.ParId = 12;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 24;
    tranType.Name = '其它支出';
    tranType.Expense = true;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 60;
    tranType.Name = '转账支出';
    tranType.Expense = true;
    tranType.ParId = 24;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 81;
    tranType.Name = '借出款项';
    tranType.Expense = true;
    tranType.ParId = 24;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 82;
    tranType.Name = '起始负债';
    tranType.Expense = true;
    tranType.ParId = 24;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 88;
    tranType.Name = '预付款支出';
    tranType.Expense = true;
    tranType.ParId = 24;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 25;
    tranType.Name = '投资、保险、博彩类支出';
    tranType.Expense = true;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 29;
    tranType.Name = '彩票支出';
    tranType.Expense = true;
    tranType.ParId = 25;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 34;
    tranType.Name = '保单投保、续保支出';
    tranType.Expense = true;
    tranType.ParId = 25;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 55;
    tranType.Name = '银行利息支出';
    tranType.Expense = true;
    tranType.ParId = 25;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 56;
    tranType.Name = '银行手续费支出';
    tranType.Expense = true;
    tranType.ParId = 25;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 86;
    tranType.Name = '偿还借贷款';
    tranType.Expense = true;
    tranType.ParId = 25;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 89;
    tranType.Name = '资产减值';
    tranType.Expense = true;
    tranType.ParId = 25;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 92;
    tranType.Name = '资产出售费用';
    tranType.Expense = true;
    tranType.ParId = 25;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 31;
    tranType.Name = '人际交往';
    tranType.Expense = true;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 32;
    tranType.Name = '红包支出';
    tranType.Expense = true;
    tranType.ParId = 31;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 47;
    tranType.Name = '请客送礼';
    tranType.Expense = true;
    tranType.ParId = 31;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 48;
    tranType.Name = '孝敬家长';
    tranType.Expense = true;
    tranType.ParId = 31;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 69;
    tranType.Name = '公共交通类';
    tranType.Expense = true;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 70;
    tranType.Name = '公交地铁等';
    tranType.Expense = true;
    tranType.ParId = 69;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 71;
    tranType.Name = '长途客车等';
    tranType.Expense = true;
    tranType.ParId = 69;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 72;
    tranType.Name = '火车动车等';
    tranType.Expense = true;
    tranType.ParId = 69;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 73;
    tranType.Name = '飞机等';
    tranType.Expense = true;
    tranType.ParId = 69;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 74;
    tranType.Name = '出租车等';
    tranType.Expense = true;
    tranType.ParId = 69;
    this._finTranType.push(tranType);
    tranType = new TranType();
    tranType.Id = 75;
    tranType.Name = '医疗保健';
    tranType.Expense = true;
    this._finTranType.push(tranType);
    // 40	NULL	衣服鞋帽	1	38	衣服鞋帽
    // 41	NULL	化妆饰品	1	38	化妆品等
    // 42	NULL	水果类	1	39	水果
    // 43	NULL	零食类	1	39	零食类
    // 44	NULL	烟酒茶类	1	39	烟酒茶等
    // 45	NULL	咖啡外卖类	1	39	咖啡与快餐
    // 46	NULL	早中晚餐	1	39	正餐类
    // 50	NULL	旅游度假	1	49	旅游度假
    // 51	NULL	电影演出	1	49	看电影，看演出等
    // 52	NULL	摄影外拍类	1	49	摄影外拍
    // 53	NULL	腐败聚会类	1	49	KTV之类
    // 57	NULL	违章付款类	1	12	违章付款等
    // 58	NULL	书刊杂志	1	54	书刊和杂志
    // 59	NULL	培训进修	1	54	培训进修类
    // 62	NULL	日用品	1	61	日用品类
    // 63	NULL	电子产品类	1	61	电子产品类
    // 64	NULL	厨房用具	1	61	厨房用具
    // 65	NULL	洗涤用品	1	61	洗涤用品
    // 66	NULL	大家电类	1	61	大家电
    // 67	NULL	保健护理用品	1	61	保健护理
    // 68	NULL	喂哺用品	1	61	NULL
    // 76	NULL	诊疗费	1	75	门诊、检查类开支
    // 77	NULL	医药费	1	75	药费类开支
    // 78	NULL	保健品费	1	75	保健品类开支
    // 79	NULL	有线电视费	1	11	有线电视费
    // 83	NULL	投资手续费支出	1	25	理财产品等投资手续费
    // 84	NULL	房租收入	0	5	房租收入等
    // 85	NULL	房租支出	1	11	房租支出等
    this._finTranType.forEach((value: any) => {
      if (!value.ParId) {
        value.HierLevel = 0;
        value.FullDisplayText = value.Name;

        this.buildTranTypeHierarchyImpl(value, this._finTranType, 1);
      }
    });

    // Account category
    this._finAccountCategories = [];
    let acntctgy: AccountCategory = new AccountCategory();
    acntctgy.ID = 1;
    acntctgy.Name = 'Sys.AcntCty.Cash';
    acntctgy.AssetFlag = true;
    acntctgy.Comment = 'Cash';
    this._finAccountCategories.push(acntctgy);
    acntctgy = new AccountCategory();
    acntctgy.ID = 2;
    acntctgy.Name = 'Sys.AcntCty.DepositAccount';
    acntctgy.AssetFlag = true;
    acntctgy.Comment = 'Deposit Account';
    this._finAccountCategories.push(acntctgy);
    acntctgy = new AccountCategory();
    acntctgy.ID = 3;
    acntctgy.Name = 'Sys.AcntCty.CreditCard';
    acntctgy.AssetFlag = false;
    acntctgy.Comment = 'CreditCard';
    this._finAccountCategories.push(acntctgy);
    acntctgy = new AccountCategory();
    acntctgy.ID = 4;
    acntctgy.Name = 'Sys.AcntCty.AccountPayable';
    acntctgy.AssetFlag = false;
    acntctgy.Comment = 'Account Payable';
    this._finAccountCategories.push(acntctgy);
    acntctgy = new AccountCategory();
    acntctgy.ID = 5;
    acntctgy.Name = 'Sys.AcntCty.AccountReceviable';
    acntctgy.AssetFlag = true;
    acntctgy.Comment = 'Account Receviable';
    this._finAccountCategories.push(acntctgy);
    acntctgy = new AccountCategory();
    acntctgy.ID = 6;
    acntctgy.Name = 'Sys.AcntCty.VirtualAccount';
    acntctgy.AssetFlag = true;
    acntctgy.Comment = 'VirtualAccount';
    this._finAccountCategories.push(acntctgy);
    acntctgy = new AccountCategory();
    acntctgy.ID = 7;
    acntctgy.Name = 'Sys.AcntCty.AssetAccount';
    acntctgy.AssetFlag = true;
    acntctgy.Comment = 'AssetAccount';
    this._finAccountCategories.push(acntctgy);
    acntctgy = new AccountCategory();
    acntctgy.ID = 8;
    acntctgy.Name = 'Sys.AcntCty.AdvancedPayment';
    acntctgy.AssetFlag = true;
    acntctgy.Comment = 'AdvancedPayment';
    this._finAccountCategories.push(acntctgy);
    acntctgy = new AccountCategory();
    acntctgy.ID = 9;
    acntctgy.Name = 'Sys.AcntCty.BorrowFrom';
    acntctgy.AssetFlag = false;
    acntctgy.Comment = 'BorrowFrom';
    this._finAccountCategories.push(acntctgy);
    acntctgy = new AccountCategory();
    acntctgy.ID = 10;
    acntctgy.Name = 'Sys.AcntCty.LendTo';
    acntctgy.AssetFlag = true;
    acntctgy.Comment = 'LendTo';
    this._finAccountCategories.push(acntctgy);
    acntctgy = new AccountCategory();
    acntctgy.ID = 11;
    acntctgy.Name = 'Sys.AcntCty.AdvancedRecv';
    acntctgy.AssetFlag = false;
    acntctgy.Comment = 'AdvancedRecv';
    this._finAccountCategories.push(acntctgy);
    acntctgy = new AccountCategory();
    acntctgy.ID = 12;
    acntctgy.Name = 'Sys.AcntCty.Insurance';
    acntctgy.AssetFlag = true;
    acntctgy.Comment = 'Insurance';
    this._finAccountCategories.push(acntctgy);
    // Asset category
    this._finAssetCategories = [];
    let asstctgy: AssetCategory;
    asstctgy = new AssetCategory();
    asstctgy.ID = 1;
    asstctgy.Name = 'Sys.AssCtgy.Apartment';
    asstctgy.Desp = 'Apartment';
    this._finAssetCategories.push(asstctgy);
    asstctgy = new AssetCategory();
    asstctgy.ID = 2;
    asstctgy.Name = 'Sys.AssCtgy.Automobile';
    asstctgy.Desp = 'Automobile';
    this._finAssetCategories.push(asstctgy);
    asstctgy = new AssetCategory();
    asstctgy.ID = 3;
    asstctgy.Name = 'Sys.AssCtgy.Furniture';
    asstctgy.Desp = 'Furniture';
    this._finAssetCategories.push(asstctgy);
    asstctgy = new AssetCategory();
    asstctgy.ID = 4;
    asstctgy.Name = 'Sys.AssCtgy.HouseAppliances';
    asstctgy.Desp = 'House Appliances';
    this._finAssetCategories.push(asstctgy);
    asstctgy = new AssetCategory();
    asstctgy.ID = 5;
    asstctgy.Name = 'Sys.AssCtgy.Camera';
    asstctgy.Desp = 'Apartment';
    this._finAssetCategories.push(asstctgy);
    asstctgy = new AssetCategory();
    asstctgy.ID = 6;
    asstctgy.Name = 'Sys.AssCtgy.Computer';
    asstctgy.Desp = 'Computer';
    this._finAssetCategories.push(asstctgy);
    asstctgy = new AssetCategory();
    asstctgy.ID = 7;
    asstctgy.Name = 'Sys.AssCtgy.MobileDevice';
    asstctgy.Desp = 'MobileDevice';
    this._finAssetCategories.push(asstctgy);
  }
  public buildFinAccounts(): void {
    // Accounts
    this._finAccounts = [];
    let acnt: Account;

    // Cash account 1
    acnt = new Account();
    acnt.Id = 11;
    acnt.Name = 'Cash 1';
    acnt.CategoryId = 1;
    acnt.OwnerId = this.userID1;
    acnt.Status = AccountStatusEnum.Normal;
    acnt.Comment = 'Cash Account 1';
    this._finAccounts.push(acnt);
    // Deposit account 1
    acnt = new Account();
    acnt.Id = 12;
    acnt.Name = 'Deposit 1';
    acnt.CategoryId = 2;
    acnt.OwnerId = this.userID1;
    acnt.Status = AccountStatusEnum.Normal;
    acnt.Comment = 'Deposit Account 1';
    this._finAccounts.push(acnt);
    // Credit card  account 1
    acnt = new Account();
    acnt.Id = 13;
    acnt.Name = 'CreditCard 1';
    acnt.CategoryId = 3;
    acnt.OwnerId = this.userID1;
    acnt.Status = AccountStatusEnum.Closed;
    acnt.Comment = 'CreditCard Account 1';
    this._finAccounts.push(acnt);
    // Asset
    acnt = new Account();
    acnt.Id = 21;
    acnt.Name = 'Asset 1';
    acnt.CategoryId = financeAccountCategoryAsset;
    acnt.Status = AccountStatusEnum.Normal;
    const asset: AccountExtraAsset = new AccountExtraAsset();
    asset.Name = 'Asset Test';
    asset.CategoryID = 1;
    acnt.ExtraInfo = asset;
    this._finAccounts.push(acnt);
    // Borrow from
    acnt = new Account();
    acnt.Id = 22;
    acnt.Name = 'Borrow from 1';
    acnt.CategoryId = financeAccountCategoryBorrowFrom;
    acnt.Status = AccountStatusEnum.Normal;
    const brwInfo: AccountExtraLoan = new AccountExtraLoan();
    brwInfo.Comment = 'Borrow test';
    brwInfo.PayingAccount = 11;
    brwInfo.RepayMethod = RepaymentMethodEnum.EqualPrincipal;
    brwInfo.TotalMonths = 12;
    brwInfo.annualRate = 0.0435;
    brwInfo.startDate = moment().subtract(1, 'M').startOf('day');
    brwInfo.endDate = brwInfo.startDate.add(1, 'y');
    brwInfo.loanTmpDocs = [];
    for (let i = 0; i < 12; i++) {
      const tmpdoc: TemplateDocLoan = new TemplateDocLoan();
      tmpdoc.DocId = i + 1;
      tmpdoc.TranAmount = 8333.34;
      tmpdoc.InterestAmount = 362.5;
      tmpdoc.Desp = `test${i + 1}`;
      tmpdoc.TranType = 28;
      tmpdoc.TranDate = brwInfo.startDate.add(i + 1, 'M');
      tmpdoc.ControlCenterId = 1;
      tmpdoc.AccountId = 22;
      brwInfo.loanTmpDocs.push(tmpdoc);
    }
    acnt.ExtraInfo = brwInfo;
    this._finAccounts.push(acnt);
    // Lend to
    acnt = new Account();
    acnt.Id = 23;
    acnt.Name = 'Lend to 1';
    acnt.CategoryId = financeAccountCategoryLendTo;
    acnt.Status = AccountStatusEnum.Normal;
    const lendto: AccountExtraLoan = new AccountExtraLoan();
    lendto.Comment = 'Lend test';
    lendto.PayingAccount = 11;
    lendto.RepayMethod = RepaymentMethodEnum.EqualPrincipal;
    lendto.TotalMonths = 12;
    lendto.annualRate = 0.0435;
    lendto.startDate = moment().subtract(1, 'M').startOf('day');
    lendto.endDate = brwInfo.startDate.add(1, 'y');
    for (let i = 0; i < 5; i++) {
      const tmpdoc: TemplateDocLoan = new TemplateDocLoan();
      tmpdoc.DocId = i + 1;
      tmpdoc.TranAmount = 8333.34;
      tmpdoc.InterestAmount = 362.5;
      tmpdoc.Desp = `test${i + 1}`;
      tmpdoc.TranType = 28;
      tmpdoc.TranDate = lendto.startDate.add(i + 1, 'M');
      tmpdoc.ControlCenterId = 1;
      tmpdoc.AccountId = 23;
      lendto.loanTmpDocs.push(tmpdoc);
    }
    acnt.ExtraInfo = lendto;
    this._finAccounts.push(acnt);
    // ADP
    acnt = new Account();
    acnt.Id = 24;
    acnt.Name = 'ADP test 1';
    acnt.CategoryId = financeAccountCategoryAdvancePayment;
    acnt.Status = AccountStatusEnum.Normal;
    const extadp: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
    extadp.Comment = 'ADP Test 1';
    extadp.RepeatType = RepeatFrequencyEnum.Month;
    for (let i = 0; i < 10; i++) {
      const item: TemplateDocADP = new TemplateDocADP();
      if (this._chosedHome) {
        item.HID = this._chosedHome.ID;
      }
      item.DocId = i + 1;
      item.TranType = 2;
      item.TranDate = moment().add(i + 1, 'M');
      item.TranAmount = 20;
      item.Desp = `item ${i + 1}`;
      item.AccountId = 24;
      extadp.dpTmpDocs.push(item);
    }
    acnt.ExtraInfo = extadp;
    this._finAccounts.push(acnt);
  }
  public buildFinAccountsFromAPI(): void {
    this._finAccountsFromAPI = [];
    for (let i = 0; i < 2; i++) {
      const acntjson: any = {
        ID: i + 1,
        Name: `Account ${i + 1}`,
        CategoryID: i + 1,
        Status: 0,
      };
      this._finAccountsFromAPI.push(acntjson as AccountJson);
    }
  }
  public buildCurrentUser(): void {
    this._currUser = new UserAuthInfo();
    const usr: any = {
      userName: this.userID1,
      userId: this.userID1Sub,
      accessToken: 'access_token',
    };

    this._currUser.setContent(usr);
  }
  public buildAppLanguage(): void {
    this._appLanguages = [];
    let alan: AppLanguage = new AppLanguage();
    alan.EnglishName = 'English';
    alan.IsoName = 'en';
    alan.AppFlag = true;
    alan.Lcid = 9;
    alan.NativeName = 'English';
    this._appLanguages.push(alan);
    alan = new AppLanguage();
    alan.Lcid = 4;
    alan.IsoName = 'zh-Hans';
    alan.EnglishName = 'Chinese (Simplified';
    alan.NativeName = '简体中文';
    alan.AppFlag = true;
    this._appLanguages.push(alan);
  }
  public buildAppLanguageFromAPI(): void {
    this._appLanguagesFromAPI = [];
    const alan: AppLanguageJson = {
      Lcid: 9,
      EnglishName: 'English',
      AppFlag: true,
      NativeName: 'English',
      ISOName: 'en',
    };
    this._appLanguagesFromAPI.push(alan);
    const alan2: AppLanguageJson = {
      Lcid: 4,
      EnglishName: 'Chinese (Simplified)',
      AppFlag: true,
      NativeName: '简体中文',
      ISOName: 'zh-Hans',
    };
    this._appLanguagesFromAPI.push(alan2);
  }
  public buildFinConfigDataFromAPI(): void {
    this._finDocTypesFromAPI = [];
    this._finAccountCategoriesFromAPI = [];
    this._finTranTypeFromAPI = [];
    this._finAssetCategoriesFromAPI = [];
    // Doc. type
    for (let i = 0; i < 2; i++) {
      const dt1: any = {
        ID: i + 1,
        Name: `Type ${i + 1}`,
        Comment: `comment for type ${i + 1}`,
      };
      this._finDocTypesFromAPI.push(dt1 as DocumentTypeJson);
    }
    // Account category
    for (let i = 0; i < 2; i++) {
      const ac1: any = {
        ID: i + 1,
        Name: `account category ${i + 1}`,
        AssetFlag: true,
        Comment: 'comment for category 1',
      };
      this._finAccountCategoriesFromAPI.push(ac1 as AccountCategoryJson);
    }
    // Tran type
    for (let i = 0; i < 3; i++) {
      const tt1: any = {
        ID: i + 1,
        Name: `tran type ${i + 1}`,
        Expense: false,
        Comment: 'comment for tran type 1',
      };
      this._finTranTypeFromAPI.push(tt1 as TranTypeJson);
    }
    // Asset category
    for (let i = 0; i < 3; i++) {
      const asc1: any = {
        ID: i + 1,
        Name: `asset ${i + 1}`,
        Desp: 'desp of asset 1',
      };
      this._finAssetCategoriesFromAPI.push(asc1 as AssetCategoryJson);
    }
  }
  public buildLibBookCategories(): void {
    this._libBookCategories = [];
    let ctgy: BookCategory;
    for (let i = 0; i < 2; i++) {
      ctgy = new BookCategory();
      ctgy.ID = i + 1;
      ctgy.Name = `Category ${i + 1}`;
      this._libBookCategories.push(ctgy);
    }
  }
  public buildTags(): void {
    this._tags = [];
    let ntag: Tag;
    for (let i = 0; i < 2; i++) {
      ntag = new Tag();
      ntag.TagType = TagTypeEnum.LearnQuestionBank;
      ntag.TagID = i + 1;
      ntag.Term = `tag ${i}`;
      this._tags.push(ntag);
    }
  }
  public buildTagsCount(): void {
    this._tagsCount = [];
    let ntagcount: TagCount;
    for (let i = 0; i < 10; i++) {
      ntagcount = new TagCount();
      ntagcount.Term = `tag${i + 1}`;
      ntagcount.TermCount = Math.round(100 * Math.random());
      this._tagsCount.push(ntagcount);
    }
  }
  public buildTagsFromAPI(): void {
    this._tagsFromAPI = [];
    for (let i = 0; i < 2; i++) {
      const ntag: TagJson = {
        tagType: 1,
        tagID: i + 1,
        term: `tag{i+1}`,
      };
      this._tagsFromAPI.push(ntag);
    }
  }
  public getFinCashAccountForCreation(): Account {
    const acnt: Account = new Account();
    acnt.Name = 'Cash 1';
    acnt.Status = AccountStatusEnum.Normal;
    if (this._chosedHome) {
      acnt.HID = this._chosedHome.ID;
      acnt.OwnerId = this._chosedHome.Host;
    }
    acnt.CategoryId = financeAccountCategoryCash;
    acnt.Comment = 'Cash 1';

    return acnt;
  }
  public getFinCreditcardAccountForCreation(): Account {
    const acnt: Account = new Account();
    acnt.Name = 'Creditcard 1';
    acnt.Status = AccountStatusEnum.Normal;
    if (this._chosedHome) {
      acnt.HID = this._chosedHome.ID;
      acnt.OwnerId = this._chosedHome.Host;
    }
    acnt.CategoryId = financeAccountCategoryCreditCard;
    acnt.Comment = 'Creditcard 1';

    return acnt;
  }
  public buildFinControlCenter(): void {
    this._finControlCenters = [];
    let ctgy: ControlCenter;
    for (let i = 0; i < 2; i++) {
      ctgy = new ControlCenter();
      ctgy.Id = i + 1;
      ctgy.HID = this._chosedHome ? this._chosedHome.ID : 0;
      ctgy.Name = `Control Center ${i + 1}`;
      this._finControlCenters.push(ctgy);
    }
    ctgy = new ControlCenter();
    ctgy.Id = 5;
    ctgy.HID = this._chosedHome ? this._chosedHome.ID : 0;
    ctgy.Name = `Control Center 1.1`;
    ctgy.ParentId = 1;
    this._finControlCenters.push(ctgy);
    ctgy = new ControlCenter();
    ctgy.Id = 6;
    ctgy.HID = this._chosedHome ? this._chosedHome.ID : 0;
    ctgy.Name = `Control Center 1.1.1`;
    ctgy.ParentId = 5;
    this._finControlCenters.push(ctgy);
  }
  public buildFinControlCenterFromAPI(): void {
    this._finControlCentersFromAPI = [];
    for (let i = 0; i < 2; i++) {
      const ctgy: any = {
        ID: i + 1,
        HomeID: this._chosedHome ? this._chosedHome.ID : 0,
        Name: `CCenter ${i + 1}`,
      };
      this._finControlCentersFromAPI.push(ctgy as ControlCenterJson);
    }
  }
  public buildFinOrders(): void {
    this._finOrders = [];
    let ctgy: Order;
    for (let i = 0; i < 2; i++) {
      ctgy = new Order();
      ctgy.Id = i + 1;
      ctgy.HID = this._chosedHome ? this._chosedHome.ID : 0;
      // ctgy.ValidFrom =
      ctgy.Name = `Order ${i + 1}`;
      // S. rules
      if (i === 0) {
        const srule: SettlementRule = new SettlementRule();
        srule.RuleId = 1;
        srule.ControlCenterId = this.finControlCenters[0].Id;
        srule.Precent = 100;
        ctgy.SRules.push(srule);
      }
      this._finOrders.push(ctgy);
    }
  }
  public buildFinOrderFromAPI(): void {
    this._finOrdersFromAPI = [];
    for (let i = 0; i < 2; i++) {
      const ctgy: any = {
        ID: i + 1,
        HomeID: this._chosedHome ? this._chosedHome.ID : 0,
        Name: `Order ${i + 1}`,
        ValidFrom: '2018-01-01',
        ValidTo: '2018-12-31',
        SRule: [],
      };
      this._finOrdersFromAPI.push(ctgy as OrderJson);
    }
  }
  public buildFinPlans(): void {
    this._finPlans = [];
    let obj: Plan;
    for (let i = 0; i < 2; i++) {
      obj = new Plan();
      obj.ID = i + 1;
      obj.HID = this._chosedHome ? this._chosedHome.ID : 0;
      obj.StartDate = moment();
      obj.TargetDate = moment().add(1, 'y');
      obj.TargetBalance = 500;
      obj.TranCurrency = this._chosedHome ? this._chosedHome.BaseCurrency : '';
      obj.Description = `Desp ${i + 1}`;
      obj.PlanType = PlanTypeEnum.TranType;
      obj.TranTypeID = financeTranTypeInterestOut;
      this._finPlans.push(obj);
    }
  }
  public setFinNormalDocumentForCreate(doc: Document): void {
    this._finNormalDocumentForCreate = doc;
  }
  public setFinTransferDocumentForCreate(doc: Document): void {
    this._finTransferDocumentForCreate = doc;
  }
  public buildFinADPDocumentForCreate(): void {
    this._finADPDocumentForCreate = new Document();
    this._finADPDocumentForCreate.Id = 100;
    this._finADPDocumentForCreate.DocType = financeDocTypeAdvancePayment;
    this._finADPDocumentForCreate.Desp = 'Test';
    this._finADPDocumentForCreate.TranCurr = 'CNY';
    this._finADPDocumentForCreate.TranDate = moment();

    const ditem: DocumentItem = new DocumentItem();
    ditem.ItemId = 1;
    ditem.AccountId = 11;
    ditem.ControlCenterId = 1;
    ditem.TranType = 2;
    ditem.Desp = 'test';
    ditem.TranAmount = 20;
    this._finADPDocumentForCreate.Items = [ditem];
  }
  public buildFinAccountExtraAdvancePayment(): void {
    this._finAccountExtraAdvancePayment = new AccountExtraAdvancePayment();
    this._finAccountExtraAdvancePayment.Comment = 'Test';
    this._finAccountExtraAdvancePayment.RepeatType = RepeatFrequencyEnum.Month;
    for (let i = 0; i < 10; i++) {
      const item: TemplateDocADP = new TemplateDocADP();
      if (this._chosedHome) {
        item.HID = this._chosedHome.ID;
      }
      item.DocId = i + 1;
      item.TranType = 2;
      item.TranDate = moment().add(i + 1, 'M');
      item.TranAmount = 20;
      item.Desp = `item ${i + 1}`;
      item.AccountId = 24;
      this._finAccountExtraAdvancePayment.dpTmpDocs.push(item);
    }
  }
  public buildFinAssetBuyInDocumentForCreate(): FinanceAssetBuyinDocumentAPI {
    const apidetail: FinanceAssetBuyinDocumentAPI = new FinanceAssetBuyinDocumentAPI();
    apidetail.HID = this._chosedHome.ID;
    apidetail.TranDate = moment().format(momentDateFormat);
    apidetail.TranCurr = this._chosedHome.BaseCurrency;
    apidetail.TranAmount = 100;
    apidetail.Desp = 'test';
    apidetail.ControlCenterID = 11;
    apidetail.IsLegacy = false;
    apidetail.AccountOwner = this._chosedHome.Members[0].User;
    apidetail.AccountAsset = new AccountExtraAsset();
    apidetail.AccountAsset.CategoryID = 2;
    apidetail.AccountAsset.Name = 'test';
    apidetail.AccountAsset.Comment = 'test';

    return apidetail;
  }
  public buildFinAssetSoldoutDocumentForCreate(): FinanceAssetSoldoutDocumentAPI {
    const detail: FinanceAssetSoldoutDocumentAPI = new FinanceAssetSoldoutDocumentAPI();
    detail.HID = this._chosedHome.ID;
    detail.TranDate = moment().format(momentDateFormat);
    detail.TranCurr = this._chosedHome.BaseCurrency;
    detail.TranAmount = 20;
    detail.Desp = 'test';
    detail.AssetAccountID = 11;
    detail.ControlCenterID = 11;

    return detail;
  }
  public buildFinAssetValueChangeDocumentForCreate(): FinanceAssetValChgDocumentAPI {
    const detailObject: FinanceAssetValChgDocumentAPI = new FinanceAssetValChgDocumentAPI();
    detailObject.HID = this._chosedHome.ID;
    detailObject.TranDate = moment().format(momentDateFormat);
    detailObject.TranCurr = this._chosedHome.BaseCurrency;
    detailObject.Desp = 'test';
    detailObject.AssetAccountID = 21;
    detailObject.ControlCenterID = 11;
    // detailObject.orderID = this.firstFormGroup.get('orderControl').value;
    // docobj.Items.forEach((val: DocumentItem) => {
    //   this.detailObject.items.push(val.writeJSONObject());
    // });

    return detailObject;
  }
  public buildFinNormalDocument(): Document {
    const doc: Document = new Document();
    doc.Id = 100;
    doc.DocType = financeDocTypeNormal;
    doc.Desp = 'Test';
    doc.TranCurr = this.chosedHome ? this.chosedHome.BaseCurrency : 'CNY';
    doc.TranDate = moment();

    const ditem: DocumentItem = new DocumentItem();
    ditem.ItemId = 1;
    ditem.AccountId = 11;
    ditem.ControlCenterId = 1;
    ditem.TranType = 2;
    ditem.Desp = 'test';
    ditem.TranAmount = 20;
    doc.Items = [ditem];

    return doc;
  }
  private buildTranTypeHierarchyImpl(par: TranType, listTranType: TranType[], curLvl: number): void {
    listTranType.forEach((value: any) => {
      if (value.ParId === par.Id) {
        value.HierLevel = curLvl;
        value.FullDisplayText = par.FullDisplayText + '.' + value.Name;

        this.buildTranTypeHierarchyImpl(value, listTranType, value.HierLevel + 1);
      }
    });
  }
  public buildBlogCollectionAPI() {
    this._blogCollectionAPI = [];
    this._blogCollectionAPI.push({
      ID: 1,
      Owner: this.userID1,
      Name: 'test1',
      Comment: 'test1',
    } as BlogCollectionAPIJson);
  }
  public buildBlogCollection() {
    this._blogCollection = [];
    this._blogCollection.push({
      id: 1,
      owner: this.userID1,
      name: 'test1',
      comment: 'test1',
    } as BlogCollection);
  }
  public buildBlogPostAPI() {
    this._blogPostAPI = [];
    this._blogPostAPI.push({
      ID: 1,
      Owner: this.userID1,
      Format: 1,
      Title: 'test1',
      Content: 'test1',
      Status: 1,
    } as BlogPostAPIJson);
  }
  public buildBlogPost() {
    this._blogPost = [];
    this._blogPost.push({
      id: 1,
      owner: this.userID1,
      format: 1,
      title: 'test1',
      content: 'test1',
      status: 1,
    } as BlogPost);
  }
  public buildPersonRoles() {
    this._personRoles = [];
    const pp: PersonRole = new PersonRole();
    pp.ID = 1;
    pp.Name = 'Test1';
    pp.Comment = 'Test1';
    this._personRoles.push(pp);
  }
}
