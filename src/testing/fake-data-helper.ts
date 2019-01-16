import { Currency, HomeDef, HomeMember, HomeMemberRelationEnum, DocumentType,
  AccountCategory, TranType, AssetCategory, Account } from '../app/model';

export class fakeDataHelper {
  private _currencies: Currency[];
  private _chosedHome: HomeDef;
  private _finDocTypes: DocumentType[];
  private _finAccountCategories: AccountCategory[];
  private _finTranType: TranType[];
  private _finAssetCategories: AssetCategory[];
  private _finAccounts: Account[];

  constructor() {  
    this._buildCurrencies();
    this._buildChosedHome();
    this._buildFinConfigData();
  }
  
  get currencies(): Currency[] {
    if (this._currencies) {
      return this._currencies;
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
  get finAccountCategories(): AccountCategory[] {
    if (this._finAccountCategories) {
      return this._finAccountCategories;
    }
  }

  private _buildCurrencies() {
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
  private _buildChosedHome() {
    this._chosedHome = new HomeDef();
    this._chosedHome.ID = 2;
    this._chosedHome.Name = 'Home for UT';
    this._chosedHome.BaseCurrency = 'CNY';
    this._chosedHome.CreatorDisplayAs = 'Creator in Home for UT';
    this._chosedHome.Host = 'abcdefg';
    let hmem: HomeMember = new HomeMember();
    hmem.HomeID = this._chosedHome.ID;
    hmem.User = this._chosedHome.Host;
    hmem.Relation = HomeMemberRelationEnum.Self;
    this._chosedHome.Members.push(hmem);
  }
  private _buildFinConfigData() {

  }
}
