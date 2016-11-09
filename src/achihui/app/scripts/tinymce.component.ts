import {
  Component,
  OnDestroy,
  AfterViewInit,
  EventEmitter,
  ElementRef,
  Inject,
  Input,
  Output
} from '@angular/core';
import { DebugLogging } from './app.setting';
declare var tinymce: any;

@Component({
    selector: 'simple-tiny',
    template: `<textarea id="{{elementId}}"></textarea>`
})
export class SimpleTinyComponent implements AfterViewInit, OnDestroy {
    @Input() elementId: String;
    @Output() onEditorKeyup = new EventEmitter<any>();

    //set mceContent(content) {
    //    if (DebugLogging) {
    //        console.log("Entering mceContent-set of SimpleTinyComponent");
    //    }
    //    this.htmlContent = content;
    //}
    //get mceContent() {
    //    if (DebugLogging) {
    //        console.log("Entering mceContent-get of SimpleTinyComponent");
    //    }
    //    return this.htmlContent;
    //}

    private elementRef: ElementRef;
    private elementID: string;
    private htmlContent: string;
    private editor: any;

    constructor( @Inject(ElementRef) elm: ElementRef) {
        if (DebugLogging) {
            console.log("Entering constructor of SimpleTinyComponent");
        }
        this.elementRef = elm;
    }

    ngAfterViewInit() {
        if (DebugLogging) {
            console.log("Entering ngAfterViewInit of SimpleTinyComponent");
        }

        tinymce.init({
            height: 500,
            selector: '#' + this.elementId,
            toolbar: "fontselect fontsizeselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link forecolor backcolor | removeformat",
            plugins: 'advlist autolink link image lists charmap print preview',
            skin_url: 'libs/tinymce/skins/lightgray',
            //setup: editor => {
            //    this.editor = editor;
            //    editor.on('keyup', () => {
            //        const content = editor.getContent();
            //        this.onEditorKeyup.emit(content);
            //    });
            setup: this.tinyMCESetup.bind(this)
        });
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of SimpleTinyComponent");
        }

        if (this.editor) {
            tinymce.remove(this.editor);
        }
    }

    tinyMCESetup(editor) {
        if (DebugLogging) {
            console.log("Entering tinyMCESetup of SimpleTinyComponent");
        }

        this.editor = editor;
        //if (this.htmlContent) {
        //    this.editor.setContent(this.htmlContent);
        //}

        this.editor.on('keyup', this.tinyMCEOnKeyup.bind(this));
    }

    tinyMCEOnKeyup(e) {
        if (DebugLogging) {
            console.log("Entering tinyMCEOnKeyup of SimpleTinyComponent");
        }

        const content = this.editor.getContent();
        this.onEditorKeyup.emit(content);
    }
}
