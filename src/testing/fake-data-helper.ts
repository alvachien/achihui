import {
  Currency, HomeDef, HomeMember, HomeMemberRelationEnum, DocumentType,
  AccountCategory, TranType, AssetCategory, Account, AccountJson,
  UserAuthInfo, AppLanguage, CurrencyJson, AppLanguageJson, DocumentTypeJson,
  AccountCategoryJson, TranTypeJson, AssetCategoryJson,
  LearnCategory, LearnCategoryJson,
  BookCategory, BookCategoryJson,
  Tag, TagJson, TagTypeEnum, TagCount, AccountStatusEnum,
  financeAccountCategoryCash, financeAccountCategoryCreditCard, financeAccountCategoryDeposit,
} from '../app/model';
import { User } from 'oidc-client';

export class FakeDataHelper {
  private _currencies: Currency[];
  private _currenciesFromAPI: CurrencyJson[];
  private _chosedHome: HomeDef;
  private _finDocTypes: DocumentType[];
  private _finDocTypesFromAPI: DocumentTypeJson[];
  private _finAccountCategories: AccountCategory[];
  private _finAccountCategoriesFromAPI: AccountCategoryJson[];
  private _finTranType: TranType[];
  private _finTranTypeFromAPI: TranTypeJson[];
  private _finAssetCategories: AssetCategory[];
  private _finAssetCategoriesFromAPI: AssetCategoryJson[];
  private _finAccounts: Account[];
  private _finAccountsFromAPI: AccountJson[];
  private _currUser: UserAuthInfo;
  private _appLanguages: AppLanguage[];
  private _appLanguagesFromAPI: AppLanguageJson[];
  private _learnCategoriesFromAPI: LearnCategoryJson[];
  private _learnCategories: LearnCategory[];
  private _libBookCategories: BookCategory[];
  private _libBookCategoriesFromAPI: BookCategoryJson[];
  private _tags: Tag[];
  private _tagsFromAPI: TagJson[];
  private _tagsCount: TagCount[];

  readonly userID1: string = 'abcdefg';
  readonly userID1Sub: string = '12345abcdefg';

  constructor() {
    // Empty
  }

  get currencies(): Currency[] {
    if (this._currencies) {
      return this._currencies;
    }
  }
  get currenciesFromAPI(): CurrencyJson[] {
    if (this._currenciesFromAPI) {
      return this._currenciesFromAPI;
    }
  }
  get chosedHome(): HomeDef {
    if (this._chosedHome) {
      return this._chosedHome;
    }
  }
  get finDocTypes(): DocumentType[] {
    if (this._finDocTypes) {
      return this._finDocTypes;
    }
  }
  get finDocTypesFromAPI(): DocumentTypeJson[] {
    if (this._finDocTypesFromAPI) {
      return this._finDocTypesFromAPI;
    }
  }
  get finAccountCategories(): AccountCategory[] {
    if (this._finAccountCategories) {
      return this._finAccountCategories;
    }
  }
  get finAccountCategoriesFromAPI(): AccountCategoryJson[] {
    if (this._finAccountCategoriesFromAPI) {
      return this._finAccountCategoriesFromAPI;
    }
  }
  get finAssetCategories(): AssetCategory[] {
    if (this._finAssetCategories) {
      return this._finAssetCategories;
    }
  }
  get finAssetCategoriesFromAPI(): AssetCategoryJson[] {
    if (this._finAssetCategoriesFromAPI) {
      return this._finAssetCategoriesFromAPI;
    }
  }
  get finTranTypes(): TranType[] {
    if (this._finTranType) {
      return this._finTranType;
    }
  }
  get finTranTypesFromAPI(): TranTypeJson[] {
    if (this._finTranTypeFromAPI) {
      return this._finTranTypeFromAPI;
    }
  }
  get finTranTypeTopNodeAmount(): number {
    if (this._finTranType) {
      return this._finTranType.filter((val: TranType) => {
        return val.ParId === undefined;
      }).length;
    }
  }
  get finAccounts(): Account[] {
    if (this._finAccounts) {
      return this._finAccounts;
    }
  }
  get finAccountsFromAPI(): AccountJson[] {
    if (this._finAccountsFromAPI) {
      return this._finAccountsFromAPI;
    }
  }
  get currentUser(): UserAuthInfo {
    if (this._currUser) {
      return this._currUser;
    }
  }
  get appLanguages(): AppLanguage[] {
    if (this._appLanguages) {
      return this._appLanguages;
    }
  }
  get appLanguagesFromAPI(): any[] {
    if (this._appLanguagesFromAPI) {
      return this._appLanguagesFromAPI;
    }
  }
  get learnCategoriesFromAPI(): LearnCategoryJson[] {
    if (this._learnCategoriesFromAPI) {
      return this._learnCategoriesFromAPI;
    }
  }
  get learnCategories(): LearnCategory[] {
    if (this._learnCategories) {
      return this._learnCategories;
    }
  }
  get libBookCategories(): BookCategory[] {
    if (this._libBookCategories) {
      return this._libBookCategories;
    }
  }
  get libBookCategoriesFromAPI(): BookCategoryJson[] {
    if (this._libBookCategoriesFromAPI) {
      return this._libBookCategoriesFromAPI;
    }
  }
  get libBookCategoriesFullReplyFromAPI(): any {
    if (this._libBookCategoriesFromAPI) {
      return {
        totalCount: this._libBookCategoriesFromAPI.length,
        contentList: this._libBookCategoriesFromAPI,
      };
    }
  }
  get tags(): Tag[] {
    if (this._tags) {
      return this._tags;
    }
  }
  get tagsFromAPI(): TagJson[] {
    if (this._tagsFromAPI) {
      return this._tagsFromAPI;
    }
  }
  get tagsCount(): TagCount[] {
    if (this._tagsCount) {
      return this._tagsCount;
    }
  }

  public buildCurrencies(): void {
    this._currencies = [];
    let curr: Currency = new Currency();
    curr.Name = 'CNY';
    curr.Symbol = '#';
    curr.DisplayName = 'Chinese Yuan';
    curr.Currency = 'CNY';
    this._currencies.push(curr);

    curr = new Currency();
    curr.Name = 'USD';
    curr.Symbol = '$';
    curr.DisplayName = 'US Dollar';
    curr.Currency = 'USD';
    this._currencies.push(curr);
  }
  public buildCurrenciesFromAPI(): void {
    this._currenciesFromAPI = [];
    let curr: CurrencyJson = {
      name: 'Chinese Yuan',
      symbol: '#',
      curr: 'CNY',
    };
    this._currenciesFromAPI.push(curr);
    let curr2: CurrencyJson = {
      name: 'US Dollar',
      symbol: '$',
      curr: 'USD',
    };
    this._currenciesFromAPI.push(curr2);
  }
  public buildChosedHome(): void {
    this._chosedHome = new HomeDef();
    this._chosedHome.ID = 2;
    this._chosedHome.Name = 'Home for UT';
    this._chosedHome.BaseCurrency = 'CNY';
    this._chosedHome.CreatorDisplayAs = 'Creator in Home for UT';
    this._chosedHome.Host = this.userID1;
    let hmem: HomeMember = new HomeMember();
    hmem.HomeID = this._chosedHome.ID;
    hmem.User = this._chosedHome.Host;
    hmem.Relation = HomeMemberRelationEnum.Self;
    this._chosedHome.Members.push(hmem);
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
  }
  public buildFinAccountsFromAPI(): void {
    this._finAccountsFromAPI = [];
    for(let i = 0; i < 2; i ++) {
      let acntjson: any = {
        id: i + 1,
        name: `Account ${i+1}`,
        ctgyID: i+1,
        status: 0,        
      };
      this._finAccountsFromAPI.push(acntjson as AccountJson);
    }
  }
  public buildCurrentUser(): void {
    this._currUser = new UserAuthInfo();
    let usr: any = {
      profile: {
        name: this.userID1,
        sub: this.userID1Sub,
        mail: 'usr@usr.com',
        access_token: 'access_token',
      },
    };

    this._currUser.setContent(usr as User);
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
    let alan: AppLanguageJson = {
      lcid: 9,
      englishName: 'English',
      appFlag: true,
      nativeName: 'English',
      isoName: 'en',
    };
    this._appLanguagesFromAPI.push(alan);
    let alan2: AppLanguageJson = {
      lcid: 4,
      englishName: 'Chinese (Simplified)',
      appFlag: true,
      nativeName: '简体中文',
      isoName: 'zh-Hans',
    };
    this._appLanguagesFromAPI.push(alan2);
  }
  public buildFinConfigDataFromAPI(): void {
    this._finDocTypesFromAPI = [];
    this._finAccountCategoriesFromAPI = [];
    this._finTranTypeFromAPI = [];
    this._finAssetCategoriesFromAPI = [];
    // Doc. type
    for(let i = 0; i < 2; i ++) {
      let dt1: any = {
        id: i+1,
        name: `Type ${i+1}`,
        comment: `comment for type ${i+1}`,
      };
      this._finDocTypesFromAPI.push(dt1 as DocumentTypeJson);
    }
    // Account category
    for(let i = 0; i < 2; i ++) {
      let ac1: any = {
        id: i+1,
        name: `account category ${i+1}`,
        assetFlag: true,
        comment: 'comment for category 1',
      };
      this._finAccountCategoriesFromAPI.push(ac1 as AccountCategoryJson);
    }
    // Tran type
    for(let i = 0; i < 3; i ++) {
      let tt1: any = {
        id: i+1,
        name: `tran type ${i+1}`,
        expense: false,
        comment: 'comment for tran type 1',
      };
      this._finTranTypeFromAPI.push(tt1 as TranTypeJson);
    }
    // Asset category
    for(let i = 0; i < 3; i ++) {
      let asc1: any = {
        id: i + 1,
        name: `asset ${i+1}`,
        desp: 'desp of asset 1',
      };
      this._finAssetCategoriesFromAPI.push(asc1 as AssetCategoryJson);
    }
  }
  public buildLearnCategoriesFromAPI(): void {
    this._learnCategoriesFromAPI = [];
    let c1: LearnCategoryJson = {
      id: 1,
      name: 'Category 1',
      sysFlag: true,
    };
    this._learnCategoriesFromAPI.push(c1);
    let c2: LearnCategoryJson = {
      id: 2,
      name: 'Category 2',
      sysFlag: true,
    };
    this._learnCategoriesFromAPI.push(c2);
    let c11: LearnCategoryJson = {
      id: 11,
      name: 'Category 1',
      sysFlag: true,
      parID: 1,
    };
    this._learnCategoriesFromAPI.push(c11);
  }
  public buildLearnCategories(): void {
    this._learnCategories = [];
    let ctgy: LearnCategory;
    ctgy = new LearnCategory();
    ctgy.Id = 1;
    ctgy.Name = 'Cat. 1';
    ctgy.SysFlag = true;
    ctgy.Comment = 'Category 1';
    this._learnCategories.push(ctgy);
    ctgy = new LearnCategory();
    ctgy.Id = 2;
    ctgy.Name = 'Cat. 2';
    ctgy.SysFlag = true;
    ctgy.Comment = 'Category 2';
    this._learnCategories.push(ctgy);
    ctgy = new LearnCategory();
    ctgy.Id = 11;
    ctgy.Name = 'Cat. 1-1';
    ctgy.ParentId = 1;
    ctgy.SysFlag = true;
    ctgy.Comment = 'Category 1.1';
    this._learnCategories.push(ctgy);
  }
  public buildLibBookCategories(): void {
    this._libBookCategories = [];
    let ctgy: BookCategory;
    for(let i = 0; i < 2; i++) {
      ctgy = new BookCategory();
      ctgy.ID = i + 1;
      ctgy.Name = `Category ${i+1}`;
      this._libBookCategories.push(ctgy);  
    }
  }
  public buildLibBookCategoriesFromAPI(): void {
    this._libBookCategoriesFromAPI = [];
    for(let i = 0; i < 2; i++) {
      let ct1: BookCategoryJson = {
        id: i + 1,
        name: `category ${i + 1}`,
      };
      this._libBookCategoriesFromAPI.push(ct1);
    }
  }
  public buildTags(): void {
    this._tags = [];
    let ntag: Tag;
    for(let i = 0; i < 2; i++) {
      ntag = new Tag();
      ntag.TagType = TagTypeEnum.LearnQuestionBank;
      ntag.TagID = i+1;
      ntag.Term = `tag ${i}`;
      this._tags.push(ntag);  
    }
  }
  public buildTagsCount(): void {
    this._tagsCount = [];
    let ntagcount: TagCount;
    for(let i = 0; i < 10; i++) {
      ntagcount = new TagCount();
      ntagcount.Term = `tag${i+1}`;
      ntagcount.TermCount = Math.round(100 * Math.random());
      this._tagsCount.push(ntagcount);
    }
  }
  public buildTagsFromAPI(): void {
    this._tagsFromAPI = [];
    for(let i = 0; i < 2; i ++) {
      let ntag: TagJson = {
        tagType: 1,
        tagID: i + 1,
        term: `tag{i+1}`,
      };
      this._tagsFromAPI.push(ntag);
    }
  }
  public getFinCashAccountForCreation(): Account {
    let acnt: Account = new Account();
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
    let acnt: Account = new Account();
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
}