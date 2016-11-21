import { DebugLogging } from '../app.setting';
import * as hih from './common';

export class EventItem extends hih.BaseModel {
    public Id: number;
    public Name: string;
    public StartTimepoint: Date;
    public EndTimepoint: Date;
    public Content: string;
    public IsPublic: boolean;
    public Owner: string;
    public RefID: number;

    constructor() {
        super();

        if (DebugLogging) {
            console.log("Entering constructor of EventItem");
        }
    }

    public onInit() {
        super.onInit();
        if (DebugLogging) {
            console.log("Entering onInit of EventItem");
        }
    }

    public onVerify(): boolean {
        if (DebugLogging) {
            console.log("Entering onVerify of EventItem");
        }
        if (!super.onVerify())
            return false;

        return true;
    }

    public writeJSONObject(): any {
        if (DebugLogging) {
            console.log("Entering writeJSONObject of EventItem");
        }

        let rstObj = super.writeJSONObject();
        return rstObj;
    }

    public onSetData(data: any) {
        if (DebugLogging) {
            console.log("Entering onSetData of EventItem");
        }

        super.onSetData(data);

        if (data && data.id) {
            this.Id = +data.id;
        }
        if (data && data.name) {
            this.Name = data.name;
        }
    }
}

export class EventRecurItem extends hih.BaseModel {

}
