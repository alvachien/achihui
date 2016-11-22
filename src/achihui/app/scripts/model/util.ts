import { DebugLogging } from '../app.setting';

export class UIPagination {
    private _totalItems: number;
    private _currentPage: number;
    private _itemsPerPage: number;
    private _maxVisualPage: number;
    private _totalPages: number;
    public visPags: Array<number>;

    constructor(itemInPage: number = 20, vispage : number = 5) {
        this._itemsPerPage = itemInPage;
        this._maxVisualPage = vispage;

        this._totalItems = 0;
        this._currentPage = 0;
    }

    get currentPage(): number {
        return this._currentPage;
    }
    set currentPage(val: number) {
        if (this._currentPage !== val) {
            this._currentPage = val;

            this.workOut();
        }
    }

    get totalCount(): number {
        return this._totalItems;
    }
    set totalCount(val: number) {
        if (this._totalItems !== val) {
            this._totalItems = val;

            this.workOut();
        }
    }

    private workOut() : void {
        if (this._totalItems === 0) {
            this.visPags = [];
            this.currentPage = 0;
        }
    }

    public isFirstVisible(): boolean {
        return this.currentPage > 1;
    }
    public isLastVisible(): boolean {
        return true;
    }
    public isNextVisible(): boolean {
        return true;
    }
    public isPreviousVisible(): boolean {
        return true;
    }

    public getNextAPIString(): string {
        return "";
    }
    public getPreviousAPIString(): string {
        return "";
    }
}