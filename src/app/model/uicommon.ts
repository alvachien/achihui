
export class CreditsComponent {
    Name: string;
    Version: string;
    Homepage: string;
    GithubRepo: string;
}

export class UIRadioButton {
    public id:string;
    public name:string;
    public value:any;
    public label: string;
    public checked: boolean;
    public disabled:boolean;
    public arialabel:string;
}

export class UIRadioButtonGroup {
    public selected:UIRadioButton;
    public value:any;
    public disabled:boolean;
}
