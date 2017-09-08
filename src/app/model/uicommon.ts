
export enum UIStatusEnum {
    NotLogin                = 0,
    LoggedinNoHomeChosen    = 1,
    LoggedinAndHomeChosen   = 2
}

/**
 * Navigation item
 */
export interface appNavItems {
    name: string;
    route: string;
}

/**
 * App languages
 */
export interface appLanguage {
    displayas: string;
    value: string;
}

// For credits part
export class CreditsComponent {
    Name: string;
    Version: string;
    Homepage: string;
    GithubRepo: string;
}

// For UI controls
export class UIRadioButton {
    public id: string;
    public name: string;
    public value: any;
    public label: string;
    public checked: boolean;
    public disabled: boolean;
    public arialabel: string;
}

export class UIRadioButtonGroup {
    public selected: UIRadioButton;
    public value: any;
    public disabled: boolean;
}

export class UIRouteLink {
    public title: string;
    public route: string;
    public icon: string;
}
