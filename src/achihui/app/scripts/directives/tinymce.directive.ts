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

    constructor(private sanitizer: DomSanitizer) {
        this.uniqueId = `tinymce-host-${TinyMceDirective2.nextUniqueId++}`;
    }

    //get accessor
    get value(): any {
        return this.innerValue;
    };

    //set accessor including call the onchange callback
    set value(v: any) {
        if (v !== this.innerValue) {
            this.innerValue = v;
            this.onChangeCallback(v);
        }
    }

    ngAfterViewInit(): void {
        console.log('tinymce');
        tinymce.init({
            selector: `[data-tinymce-uniqueid=${this.uniqueId}]`,
            schema: 'html5',
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
        const content = tinymce.activeEditor.getContent();
        this.value = this.sanitizer.bypassSecurityTrustHtml(content);
    }

    writeValue(value): void {
        if (value !== this.innerValue) {
            this.innerValue = value;
            if (this.init && value) tinymce.activeEditor.setContent(value);
        }
    }

    registerOnChange(fn): void {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn): void {
        this.onTouchedCallback = fn;
    }

    ngOnDestroy(): void {
        if (this.init) tinymce.remove(`[data-tinymce-uniqueid=${this.uniqueId}]`);
    }
}
