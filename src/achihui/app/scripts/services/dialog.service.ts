import { Injectable } from '@angular/core';
declare var alertify: any;

/**
 * Async modal dialog service
 * DialogService makes this app easier to test by faking this service.
 */
@Injectable()
export class DialogService {
    constructor() {
        var elem = document.getElementById("alertifyjs");
        alertify.parent(elem);
    }

    /**
     * Ask user to confirm an action. `message` explains the action and choices.
     * Returns promise resolving to `true`=confirm or `false`=cancel
     */
    confirm(message?: string, okFunc?: Function, cancelFunc?:Function) {
        alertify.confirm(message, okFunc, cancelFunc);

        //return new Promise<boolean>(resolve => {            
        //    alertify.confirm(message, function () {
        //        // user clicked "ok"
        //        return resolve(true);
        //    }, function () {
        //        // user clicked "cancel"
        //        return resolve(false);
        //    });
        //});

        // Origin implement
        //return new Promise<boolean>(resolve => {
        //    return resolve(window.confirm(message || 'Is it OK?'));
        //});

        //alertify.confirm("Confirm?").then(function (resolvedValue) {
        //    // "resolvedValue" is an object with the following keys:
        //    // buttonClicked
        //    // inputValue (only for prompts)
        //    // event

        //    // The click event is in
        //    // resolvedValue, so you can use
        //    // it here.
        //    resolvedValue.event.preventDefault();
        //    alertify.alert("You clicked the " + resolvedValue.buttonClicked + " button!");
        //});
    };
    prompt(message?: string, value?: any, okFunc?: Function, cancelFunc?: Function) {
        var elem = document.getElementById("alertifyjs");
        alertify.parent(elem);

        alertify
            .defaultValue(value)
            .prompt(message, okFunc, cancelFunc);
            //function (val, ev) {

            //    // The click event is in the event variable, so you can use it here.
            //    ev.preventDefault();

            //    // The value entered is availble in the val variable.
            //    alertify.success("You've clicked OK and typed: " + val);

            //}, function (ev) {

            //    // The click event is in the event variable, so you can use it here.
            //    ev.preventDefault();

            //    alertify.error("You've clicked Cancel");

            //}
    };
    log(message?: string, type?: string) {
        //window.confirm(message || 'Is it OK?');
        let realtype: string;
        if (type) {
            realtype = type;
        } else {
            realtype = "log";
        }
        alertify.logPosition("top right");
        if (realtype === "log")
            alertify.log(message);
        else if (realtype === "success")
            alertify.success(message);
        else if (realtype === "error") {
            alertify
                .closeLogOnClick(true)
                .error(message);
        }            
    }
}
