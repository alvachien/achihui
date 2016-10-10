import { DebugLogging } from '../app.setting';
import * as hih from './common';

export class FinanceSetting extends hih.BaseModel {
    public LocalCurrency: string;
    public LocalCurrencyComment: string;
    public CurrencyExchangeToilence: number;
    public CurrencyExchangeToilenceComment: string;
}

export class FinanceExchangeRate extends hih.BaseModel {
    public TranDate: Date;
    public ForeignCurrency: string;
    public Rate: number;
    public RefDocId: number;
}

export class Currency extends hih.BaseModel {
    public Currency: string;
    public Name: String;
    public Symbol: String;
    public IsLocalCurrency: boolean;
}

export class AccountCategory extends hih.BaseModel {
    public Id: number;
    public Name: string;
    public IsAsset: boolean;
    public Comment: string;
}

export class DocumentType extends hih.BaseModel {
    public Id: number;
    public Name: string;
    public Comment: string;
}

export class Account extends hih.BaseModel {
    public Id: number;
    public CategoryId: number;
    public Name: string;
    public Comment: string;

    public ExtraInfo: AccountExtra;
}

export abstract class AccountExtra {
}

export class AccountExtraDownpayment extends AccountExtra {
    public Direct: string;
    public StartDate: Date;
    public EndDate: Date;
    public RepeatType: number;
    public RefDocId: number;
    public Others: string;
}

export class ControllingCenter extends hih.BaseModel {
    public Id: number;
    public Name: string;
    public ParentId: number;
    public Comment: string;
}

export class SettlementRule extends hih.BaseModel {

}