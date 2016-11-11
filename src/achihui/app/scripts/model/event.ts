import { DebugLogging } from '../app.setting';
import * as hih from './common';

export class EventItem extends hih.BaseModel {
    public EventId: number;
    public EventDate: Date;
    public Name: string;
    public Content: string;

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
    }
}
