import * as moment from 'moment';

/**
 * Relationship 
 */
export enum HomeMemberRelationEnum {
    Self    = 0,
    Couple  = 1,
    Child   = 2,
    Parent  = 3,
}

export function getHomeMemberRelationString(re: HomeMemberRelationEnum) {
    switch(re) {
        case HomeMemberRelationEnum.Self: return 'Common.Self';
        case HomeMemberRelationEnum.Couple: return 'Common.Couple';
        case HomeMemberRelationEnum.Child: return 'Common.Child';
        case HomeMemberRelationEnum.Parent: return 'Common.Parent';
        default: return '';
    }
}

/**
 * Home members
 */
export interface HomeMemberJson {
    homeID: number;
    user: string;
    displayAs: string;
    relation: HomeMemberRelationEnum;
}

/**
 * Home member
 */
export class HomeMember {
    private _hid: number;
    private _user: string;
    private _displayas: string;
    private _relation: HomeMemberRelationEnum;

    get HomeID(): number {
        return this._hid;
    }
    set HomeID(hid: number) {
        this._hid = hid;
    }
    get User(): string {
        return this._user;
    }
    set User(usr: string) {
        this._user = usr;
    }
    get DisplayAs(): string {
        return this._displayas;
    }
    set DisplayAs(da: string) {
        this._displayas = da;
    }
    get Relation(): HomeMemberRelationEnum {
        return this._relation;
    }
    set Relation(rel: HomeMemberRelationEnum) {
        this._relation = rel;
    }
    get RelationString(): string {
        return getHomeMemberRelationString(this._relation);
    }

    constructor() {
    }

    public parseJSONData(data: HomeMemberJson) {
        this._hid = data.homeID;
        this._user = data.user;
        this._displayas = data.displayAs;
        this._relation = +data.relation;
    }
    public generateJSONData(): HomeMemberJson {
        let jdata: HomeMemberJson = {
            homeID: this._hid,
            user: this._user,
            displayAs: this._displayas,
            relation: this._relation,
        };
        return jdata;
    }
}

/**
 * Home definition JSON
 */
export interface HomeDefJson {
    id?: number;
    name: string;
    details: string;
    host: string;
    baseCurrency: string;
    creatorDisplayAs?: string; // For creation

    members?: HomeMemberJson[];
}

/**
 * Home definition
 */
export class HomeDef {
    private _id: number;
    private _name: string;
    private _details: string;
    private _host: string;
    private _basecurr: string;
    private _creatorDisplayAs: string; // Only for creation mode!
    private _listMembers: HomeMember[];

    get ID(): number {
        return this._id;
    }
    set ID(id: number) {
        this._id = id;
    }
    get Name(): string {
        return this._name;
    }
    set Name(nm: string) {
        this._name = nm;
    }
    get Details(): string {
        return this._details;
    }
    set Details(dt: string) {
        this._details = dt;
    }
    get Host(): string {
        return this._host;
    }
    set Host(host: string) {
        this._host = host;
    }
    get BaseCurrency(): string {
        return this._basecurr;
    }
    set BaseCurrency(curr: string) {
        this._basecurr = curr;
    }
    get CreatorDisplayAs(): string {
        return this._creatorDisplayAs;
    }
    set CreatorDisplayAs(ds: string) {
        this._creatorDisplayAs = ds;
    }

    get Members(): HomeMember[] {
        return this._listMembers;
    }

    constructor() {
        this._listMembers = [];
    }

    public parseJSONData(data: HomeDefJson) {
        this._id = data.id;
        this._name = data.name;
        this._details = data.details;
        this._host = data.host;
        this._basecurr = data.baseCurrency;

        this._listMembers = [];
        if (data.members) {
            for(let mem of data.members) {
                let hmem: HomeMember = new HomeMember();
                hmem.parseJSONData(mem);
                this._listMembers.push(hmem);
            }
        }
    }

    public generateJSONData(createmode?: boolean): HomeDefJson {
        let jdata: HomeDefJson = {
            id: this._id,
            name: this._name,
            details: this._details,
            host: this._host,
            baseCurrency: this._basecurr,
        };
        if (createmode) {
            jdata.creatorDisplayAs = this._creatorDisplayAs;
        }

        return jdata;
    }
}

/**
 * Home message JSON
 */
export interface HomeMsgJson {
    hid: number;
}

/**
 * Home message
 */
export class HomeMsg {
    private _hid: number;
    private _usrto: string;
    private _usrfrom: string;
    private _senddate: moment.Moment;
}
