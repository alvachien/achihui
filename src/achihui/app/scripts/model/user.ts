import { DebugLogging } from '../app.setting';

export class UserDetail {
    public UserId: string;
    public DisplayAs: string;
    public Email: string;
    public Others: string;

    public onSetData(data: any) {
        if (DebugLogging) {
            console.log("Entering onSetData of UserDetail");
        }

        this.UserId = data.userId;
        this.DisplayAs = data.displayAs;
        this.Email = data.email;
        this.Others = data.others;
    }
}

export class UserHistory {
    public UserId: string;
    public SeqNo: number;
    public HistType: number;
    public TimePoint: Date;
    public Others: string;

    public onSetData(data: any) {
        if (DebugLogging) {
            console.log("Entering onSetData of UserHistory");
        }

        this.UserId = data.userId;
        this.SeqNo = data.seqNo;
        this.HistType = data.histType;
        this.TimePoint = data.timePoint;
        this.Others = data.others;
    }
}
