import { environment } from '../../environments/environment';
import * as hih from './common';

export class UIFinTransferDocument {
    public TranAmount: number;
    public SourceAccountId: number;
    public TargetAccountId: number;
    public SourceControlCenterId: number;
    public TargetControlCenterId: number;
    public SourceOrderId: number;
    public TargetOrderId: number;
    
    public SourceAccountName: string;
    public TargetAccountName: string;
    public SourceControlCenterName: string;
    public TargetControlCenterName: string;
    public SourceOrderName: string;
    public TargetOrderName: string;
}
