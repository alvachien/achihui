import {
    Directive,
    OnDestroy,
    AfterViewInit,
    Provider,
    forwardRef,
    HostBinding
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { DebugLogging } from '../app.setting';

declare var tinymce: any;

export const TinyMceValueAccessor: Provider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TinyMceDirective2),
    multi: true
};

// Tinymce directive
@Directive({
    selector: '[htmlEditor]',
    providers: [TinyMceValueAccessor]
})
export class TinyMceDirective2 implements OnDestroy, AfterViewInit, ControlValueAccessor {
    static nextUniqueId = 0;
    @HostBinding('attr.data-tinymce-uniqueid') uniqueId;

    onTouchedCallback: () => void = () => { };
    onChangeCallback: (_: any) => void = () => { };
    innerValue;
    init = false;

    constructor(
        //private sanitizer: DomSanitizer
    ) {
        if (DebugLogging) {
            console.log("Entering constructor of TinyMceDirective2");
        }
        this.uniqueId = `tinymce-host-${TinyMceDirective2.nextUniqueId++}`;
    }

    //get accessor
    get value(): any {
        if (DebugLogging) {
            console.log("Entering value-get of TinyMceDirective2");
        }
        return this.innerValue;
    };

    //set accessor including call the onchange callback
    set value(v: any) {
        if (DebugLogging) {
            console.log("Entering value-set of TinyMceDirective2");
        }
        if (v !== this.innerValue) {
            this.innerValue = v;
            this.onChangeCallback(v);
        }
    }

    ngAfterViewInit(): void {
        if (DebugLogging) {
            console.log("Entering ngAfterViewInit of TinyMceDirective2");
        }
        tinymce.init({
            selector: `[data-tinymce-uniqueid=${this.uniqueId}]`,
            schema: 'html5',
            height: 500,
            menubar: false,
            toolbar: "fontselect fontsizeselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link forecolor backcolor | removeformat",
            plugins: 'advlist autolink link image lists charmap print preview',
            skin_url: 'libs/tinymce/skins/lightgray',
            //insert_toolbar: 'quickimage quicktable',
            //selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
            //inline: true,
            //paste_data_images: true,
            setup: ed => {
                ed.on('init', ed2 => {
                    if (this.innerValue) ed2.target.setContent(this.innerValue);
                    this.init = true;
                });
            }
        });

        // I chose to send an update on blur, you may choose otherwise
        tinymce.activeEditor.on('blur', () => this.updateValue());
    }

    updateValue() {
        if (DebugLogging) {
            console.log("Entering updateValue of TinyMceDirective2");
        }
        const content = tinymce.activeEditor.getContent();
        //this.value = this.sanitizer.bypassSecurityTrustHtml(content);
        this.value = content;
    }

    writeValue(value): void {
        if (DebugLogging) {
            console.log("Entering writeValue of TinyMceDirective2");
        }
        if (value !== this.innerValue) {
            this.innerValue = value;
            if (this.init && value) tinymce.activeEditor.setContent(value);
        }
    }

    registerOnChange(fn): void {
        if (DebugLogging) {
            console.log("Entering registerOnChange of TinyMceDirective2");
        }
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn): void {
        if (DebugLogging) {
            console.log("Entering registerOnTouched of TinyMceDirective2");
        }
        this.onTouchedCallback = fn;
    }

    ngOnDestroy(): void {
        if (this.init) tinymce.remove(`[data-tinymce-uniqueid=${this.uniqueId}]`);
    }
}
