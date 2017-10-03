import {
    Directive,
    OnDestroy,
    AfterViewInit,
    Provider,
    forwardRef,
    HostBinding,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../environments/environment';
import { LogLevel } from '../model';

declare var tinymce: any;

export const TinyMceValueAccessor: Provider = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TinyMceDirective),
    multi: true,
};

// Tinymce directive
@Directive({
    selector: '[htmlEditor]',
    providers: [TinyMceValueAccessor],
})
export class TinyMceDirective implements OnDestroy, AfterViewInit, ControlValueAccessor {
    static nextUniqueId = 0;
    @HostBinding('attr.data-tinymce-uniqueid') uniqueId;

    onTouchedCallback: () => void = () => { };
    onChangeCallback: (_: any) => void = () => { };
    innerValue;
    init = false;

    constructor(
        //private sanitizer: DomSanitizer
    ) {
        this.uniqueId = `tinymce-host-${TinyMceDirective.nextUniqueId++}`;
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

    set readonly(isro: boolean) {
        if (isro) {
            tinymce.activeEditor.setMode('readonly');
        }
    }

    ngAfterViewInit(): void {
        if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log('AC_HIH_UI [Debug]: Entering ngAfterViewInit of TinyMceDirective');
        }

        try {
            tinymce.init({
                selector: `[data-tinymce-uniqueid=${this.uniqueId}]`,
                schema: 'html5',
                height: 500,
                menubar: false,
                toolbar: 'fontselect fontsizeselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link forecolor backcolor | removeformat',
                plugins: 'advlist autolink link image lists charmap print preview',
                skin_url: '../../assets/tinymceskins/lightgray',
                //insert_toolbar: 'quickimage quicktable',
                //selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
                //inline: true,
                //paste_data_images: true,
                setup: (ed) => {
                    ed.on('init', (ed2) => {
                        if (this.innerValue) ed2.target.setContent(this.innerValue);
                        this.init = true;
                    });
                },
            });

            tinymce.activeEditor.on('keyup change', () => this.updateValue());
        } catch (err) {
            if (environment.LoggingLevel >= LogLevel.Error) {
                console.error(`AC_HIH_UI [Debug]: Exception in ngAfterViewInit of TinyMceDirective: ${err ? err.toString() : ''}`);
            }
        }
    }

    updateValue() {
        const content = tinymce.activeEditor.getContent();
        //this.value = this.sanitizer.bypassSecurityTrustHtml(content);
        this.value = content;
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
        if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log('AC_HIH_UI [Debug]: Entering ngOnDestroy of TinyMceDirective');
        }

        try {
            if (this.init) tinymce.remove(`[data-tinymce-uniqueid=${this.uniqueId}]`);
        } catch (err) {
            if (environment.LoggingLevel >= LogLevel.Error) {
                console.error(`AC_HIH_UI [Debug]: Exception in ngAfterViewInit of LearnObjectDetail: ${err ? err.toString() : ''}`);
            }
        }
    }
}
