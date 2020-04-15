import { Component, OnInit, ViewChild, ElementRef, Input, OnDestroy, forwardRef, HostListener, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormControl,
  Validator, Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { insertTextIntoElement, scrollToElementCenter, readElementText, } from 'actslib';
import * as marked from 'marked';
import * as highlightjs from 'highlight.js';
import * as katex from 'katex';

// Constants for commands
const commandFormatBlock = 'formatBlock';
const commandParagraphSeparator = 'defaultParagraphSeparator';

// Enum for toolbar buttons
export enum EditorToolbarButtonEnum {
  bold = 'bold',
  italic = 'italic',
  underline = 'underline',
  strikethrough = 'strikethrough',
  heading1 = 'heading1',
  heading2 = 'heading2',
  heading3 = 'heading3',
  heading4 = 'heading4',
  heading5 = 'heading5',
  heading6 = 'heading6',
  paragraph = 'paragraph',
  quote = 'quote',
  orderedlist = 'orderedlist',
  unorderedlist = 'unorderedlist',
  code = 'code',
  horizontalline = 'horizontalline',
  link = 'link',
  image = 'image',
  undo = 'undo',
  redo = 'redo',
  math = 'math'
}

// Config for editor
export interface IACMEditorConfig {
  toolbarItems?: EditorToolbarButtonEnum[];
  height?: number;
  width?: number;
  maxLength?: number;
}

@Component({
  selector: 'ac-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MarkdownEditorComponent),
      multi: true,
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MarkdownEditorComponent),
      multi: true,
    },
  ],  
})
export class MarkdownEditorComponent implements OnInit, OnDestroy, ControlValueAccessor, Validator {
  @ViewChild('acme_wrapper', { static: true }) erWrapper: ElementRef;
  @ViewChild('acme_toolbar', { static: true }) erToolbar: ElementRef;
  // @ViewChild('acme_content', {static: true}) erContent: ElementRef;
  @ViewChild('acme_content_editor', { static: true }) erContentEditor: ElementRef;
  // @ViewChild('acme_content_splitter', {static: true}) erContentSplitter: ElementRef;
  @ViewChild('acme_content_preview', { static: true }) erContentPreview: ElementRef;
  @Input() config: IACMEditorConfig;
  @Output() contentChanged: EventEmitter<string> = new EventEmitter();

  isDialogMathOpen = false;
  mathDialogInput: string;
  // tslint:disable-next-line:variable-name
  private _onChange: (val: any) => void;
  // tslint:disable-next-line:variable-name
  private _onTouched: () => void;

  defaultToolbarItems: EditorToolbarButtonEnum[] = [
    EditorToolbarButtonEnum.bold,
    EditorToolbarButtonEnum.italic,
    EditorToolbarButtonEnum.underline,
    EditorToolbarButtonEnum.strikethrough,
    EditorToolbarButtonEnum.heading1,
    EditorToolbarButtonEnum.heading2,
    EditorToolbarButtonEnum.heading3,
    EditorToolbarButtonEnum.heading4,
    EditorToolbarButtonEnum.heading5,
    EditorToolbarButtonEnum.heading6,
    EditorToolbarButtonEnum.paragraph,
    EditorToolbarButtonEnum.quote,
    EditorToolbarButtonEnum.orderedlist,
    EditorToolbarButtonEnum.unorderedlist,
    EditorToolbarButtonEnum.code,
    EditorToolbarButtonEnum.horizontalline,
    EditorToolbarButtonEnum.link,
    EditorToolbarButtonEnum.image,
    EditorToolbarButtonEnum.undo,
    EditorToolbarButtonEnum.redo,
    EditorToolbarButtonEnum.math,
  ];
  toolbarItems: EditorToolbarButtonEnum[] = [];
  rangeSelection: Range;

  public get markdownValue(): any {
    return this._markdownValue || '';
  }
  public set markdownValue(value: any) {
    this._markdownValue = value;
    this._onChange(value);

    // if (this.preRender && this.preRender instanceof Function) {
    //   value = this.preRender(value);
    // }
    if (value !== null && value !== undefined) {
      if (this._renderMarkTimeout) {
        clearTimeout(this._renderMarkTimeout);
      }

      this._renderMarkTimeout = setTimeout(() => {
        const html = marked(value || '', this._markedOpt);
        // let previewHtml = this._domSanitizer.bypassSecurityTrustHtml(html);
        if (this.erContentPreview) {
          this.erContentPreview.nativeElement.innerHTML = html;
          const chlds = this.erContentPreview.nativeElement.getElementsByClassName('katex');
          const orgcount = chlds.length;
          const chldelems: any[] = [];
          for (let i = 0; i < orgcount; i++) {
            chldelems.push(chlds.item(i));
            // chdelem.setAttribute('font-size', '1.6em');
            // css("font-size", "1.6em");
          }
          chldelems.forEach((cel: any) => {
            katex.render(cel.textContent, cel, {
              throwOnError: false
            });
          });
        }
      }, 100);
    }
  }
  // tslint:disable-next-line:variable-name
  private _markdownValue: any;
  // tslint:disable-next-line:variable-name
  private _renderMarkTimeout: any;
  // tslint:disable-next-line:variable-name
  private _markedOpt: any;

  // @HostListener('change') onChange(): void {
  //   if (this._onChange) {
  //     this._onChange(this.erContent.nativeElement.innerHTML);
  //   }
  // }
  // @HostListener('blur') onTouched(): void {
  //   if (this._onTouched) {
  //     this._onTouched();
  //   }
  // }

  public isToolbarItemExist(item: string): boolean {
    return this.toolbarItems.some((searchElement: EditorToolbarButtonEnum) => {
      return searchElement === (item as EditorToolbarButtonEnum);
    });
  }

  public isToolbarButtonStatus(item: string): boolean {
    const btn = item as EditorToolbarButtonEnum;
    let rst = false;
    switch (btn) {
      case EditorToolbarButtonEnum.bold:
        rst = document.queryCommandState('bold');
        break;
      case EditorToolbarButtonEnum.italic:
        rst = document.queryCommandState('italic');
        break;
      case EditorToolbarButtonEnum.underline:
        rst = document.queryCommandState('underline');
        break;
      case EditorToolbarButtonEnum.strikethrough:
        rst = document.queryCommandState('strikeThrough');
        break;

      default:
        break;
    }

    return rst;
  }

  constructor() {
    // Empty
  }

  ngOnInit() {
    this.toolbarItems = [];
    if (this.config && this.config.toolbarItems) {
      this.config.toolbarItems.forEach((value: EditorToolbarButtonEnum) => {
        this.toolbarItems.push(value);
      });
    } else {
      this.toolbarItems.push(...this.defaultToolbarItems);
    }

    // Width and height
    if (this.config.width) {
      this.erContentEditor.nativeElement.style.width = this.config.width + 'px';
      this.erContentPreview.nativeElement.style.width = this.config.width + 'px';
    }
    if (this.config.height) {
      this.erContentEditor.nativeElement.style.height = this.config.height + 'px';
      this.erContentPreview.nativeElement.style.height = this.config.height + 'px';
    }

    const markedRender = new marked.Renderer();
    markedRender.code = (code: any, language: any) => {
      if (language === 'seq' || language === 'sequence') {
        return '<div class="sequence-diagram">' + code + '</div>';
      } else if (language === 'flow') {
        return '<div class="flowchart">' + code + '</div>';
      } else if (language === 'math' || language === 'latex' || language === 'katex') {
        return '<p class="katex">' + code + '</p>';
      } else {
        const validLang = !!(language && highlightjs.getLanguage(language));
        const highlighted = validLang ? highlightjs.highlight(language, code).value : code;
        return `<pre style="padding: 0; border-radius: 0;"><code class="hljs ${language}">${highlighted}</code></pre>`;
      }
    };
    markedRender.table = (header: string, body: string) => {
      return `<table class="table table-bordered">\n<thead>\n${header}</thead>\n<tbody>\n${body}</tbody>\n</table>\n`;
    };
    // markedRender.listitem = (text: any, task: boolean, checked: boolean) => {
    //   if (/^\s*\[[x ]\]\s*/.test(text) || text.startsWith('<input')) {
    //     if (text.startsWith('<input')) {
    //       text = text
    //         .replace('<input disabled="" type="checkbox">', '<i class="fa fa-square-o"></i>')
    //         .replace('<input checked="" disabled="" type="checkbox">', '<i class="fa fa-check-square"></i>');
    //     } else {
    //       text = text
    //         .replace(/^\s*\[ \]\s*/, '<i class="fa fa-square-o"></i> ')
    //         .replace(/^\s*\[x\]\s*/, '<i class="fa fa-check-square"></i> ');
    //     }
    //     return `<li>${text}</li>`;
    //   } else {
    //     return `<li>${text}</li>`;
    //   }
    // };
    markedRender.paragraph = (text: any) => {
      const isTeXInline = /\$\$(.*)\$\$/g.test(text);
      const isTeXLine = /^\$\$(.*)\$\$$/.test(text);
      const isTeXAddClass = (isTeXLine) ? ' class="katex"' : '';
      // var isToC           = (settings.tocm) ? /^(\[TOC\]|\[TOCM\])$/.test(text) : /^\[TOC\]$/.test(text);
      // var isToCMenu       = /^\[TOCM\]$/.test(text);

      if (!isTeXLine && isTeXInline) {
        text = text.replace(/(\$\$([^\$]*)\$\$)+/g, ($1, $2) => {
          return '<span class="katex">' + $2.replace(/\$/g, '') + '</span>';
        });
      } else {
        text = (isTeXLine) ? text.replace(/\$/g, '') : text;
      }

      return '<p' + isTeXAddClass + '>' + text + '</p>\n';
      // var tocHTML = "<div class=\"markdown-toc editormd-markdown-toc\">" + text + "</div>";
      // return (isToC) ? ( (isToCMenu) ? "<div class=\"editormd-toc-menu\">" + tocHTML + "</div><br/>" : tocHTML )
      // tslint:disable-next-line:max-line-length
      //                : ( (pageBreakReg.test(text)) ? this.pageBreak(text) : "<p" + isTeXAddClass + ">" + this.atLink(this.emoji(text)) + "</p>\n" );
    };
    this._markedOpt = {
      renderer: markedRender,
      highlight: (code: any) => highlightjs.highlightAuto(code).value
    };
    // this._markedOpt = Object.assign({}, markedjsOpt, this.options.markedjsOpt);
  }

  ngOnDestroy() {
    this.toolbarItems = [];
  }

  // onSplitterMouseDown(event) {
  //   this.erContentSplitter.nativeElement.eraddEventListener('mousemove', this.onSplitterDrag);
  // }
  // onSplitterMouseUp(event) {
  //   this.erContentSplitter.nativeElement.removeEventListener('mousemove', this.onSplitterDrag);
  // }

  // onSplitterDrag(e: MouseEvent) {
  //   window.getSelection().removeAllRanges();
  //   this.erContentEditor.nativeElement.style.width = (e.pageX - this.erContentSplitter.nativeElement.offsetWidth / 2) + 'px';
  // }

  writeValue(val: any): void {
    this.erContentEditor.nativeElement.innerHTML = val as string;
  }
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.erWrapper.nativeElement.disable = true;
    } else {
      this.erWrapper.nativeElement.disable = true;
    }
  }

  onToolbarButtonClick(event: MouseEvent, btn: string): void {
    const titem: EditorToolbarButtonEnum = btn as EditorToolbarButtonEnum;
    switch (titem) {
      case EditorToolbarButtonEnum.bold:
        document.execCommand('bold', false);
        this.erContentEditor.nativeElement.focus();
        break;

      case EditorToolbarButtonEnum.italic:
        document.execCommand('italic', false);
        this.erContentEditor.nativeElement.focus();
        break;

      case EditorToolbarButtonEnum.underline:
        document.execCommand('underline', false);
        this.erContentEditor.nativeElement.focus();
        break;

      case EditorToolbarButtonEnum.strikethrough:
        document.execCommand('strikeThrough', false);
        this.erContentEditor.nativeElement.focus();
        break;
      case EditorToolbarButtonEnum.heading1:
        document.execCommand(commandFormatBlock, false, '<h1>');
        this.erContentEditor.nativeElement.focus();
        break;
      case EditorToolbarButtonEnum.heading2:
        document.execCommand(commandFormatBlock, false, '<h2>');
        this.erContentEditor.nativeElement.focus();
        break;
      case EditorToolbarButtonEnum.heading3:
        document.execCommand(commandFormatBlock, false, '<h3>');
        this.erContentEditor.nativeElement.focus();
        break;
      case EditorToolbarButtonEnum.paragraph:
        document.execCommand(commandFormatBlock, false, '<p>');
        this.erContentEditor.nativeElement.focus();
        break;
      case EditorToolbarButtonEnum.quote:
        document.execCommand(commandFormatBlock, false, '<blockquote>');
        this.erContentEditor.nativeElement.focus();
        break;
      case EditorToolbarButtonEnum.orderedlist:
        document.execCommand('insertOrderedList', false);
        this.erContentEditor.nativeElement.focus();
        break;
      case EditorToolbarButtonEnum.unorderedlist:
        document.execCommand('insertUnorderedList', false);
        this.erContentEditor.nativeElement.focus();
        break;
      case EditorToolbarButtonEnum.code:
        document.execCommand(commandFormatBlock, false, '<pre>');
        this.erContentEditor.nativeElement.focus();
        break;
      case EditorToolbarButtonEnum.horizontalline:
        document.execCommand('insertHorizontalRule', false);
        this.erContentEditor.nativeElement.focus();
        break;
      case EditorToolbarButtonEnum.link:
      case EditorToolbarButtonEnum.image:
        // TBD.
        this.erContentEditor.nativeElement.focus();
        break;
      case EditorToolbarButtonEnum.math:
        this.isDialogMathOpen = true;
        this.erContentEditor.nativeElement.focus();
        break;

      default:
        break;
    }
  }

  ///
  /// Editor's events
  onContentEditorKeyUp(event: KeyboardEvent): void {
    this.rangeSelection = window.getSelection().getRangeAt(0).cloneRange();
  }
  onContentEditorKeyPress(event: KeyboardEvent): void {
    // if (!event.metaKey && !event.ctrlKey && event.key === 'Enter') {
    //   insertTextIntoElement(this.erContentEditor.nativeElement, '\n', '');
    //   // TBD: Add to undo

    //   scrollToElementCenter(this.erContentEditor.nativeElement);
    //   event.preventDefault();
    // }
  }
  onContentEditorKeyInput(event): void {
    this.refreshControls();

    // this.erContentEditor.nativeElement.querySelectorAll('br').forEach((br) => {
    //   if (!br.nextElementSibling) {
    //     br.insertAdjacentHTML('afterend', '<span style="display: none">\n</span>');
    //   }
    // });
  }
  // onContentEditorChange(event): void {
  //   this.markdownValue = this.erContentEditor.nativeElement.value;
  //   // const targetElement: HTMLDivElement = event.target as HTMLDivElement;
  //   // if (targetElement && targetElement.firstChild && targetElement.firstChild.nodeType === 3) {
  //   //   document.execCommand(commandFormatBlock, false, `${this.paragraphSeparator}`);
  //   // } else if (this.erContentEditor.nativeElement.innerHTML === '<br>') {
  //   //   this.erContentEditor.nativeElement.innerHTML = '';
  //   // }

  //   // this.contentChanged.emit(this.erContentEditor.nativeElement.innerText);
  // }
  onContentEditorScroll(event): void {
    const textScrollTop = this.erContentEditor.nativeElement.scrollTop;
    const textHeight = this.erContentEditor.nativeElement.clientHeight;
    const textScrollHeight = this.erContentEditor.nativeElement.scrollHeight
      - (this.erContentEditor.nativeElement.style.paddingBottom ? parseFloat(this.erContentEditor.nativeElement.style.paddingBottom) : 0);

    if ((textScrollTop / textHeight > 0.5)) {
      this.erContentPreview.nativeElement.scrollTop = (textScrollTop + textHeight) *
        this.erContentPreview.nativeElement.scrollHeight / textScrollHeight - textHeight;
    } else {
      this.erContentPreview.nativeElement.scrollTop = textScrollTop *
        this.erContentPreview.nativeElement.scrollHeight / textScrollHeight;
    }
  }
  onContentEditorBlur(event): void {
    // TBD.
  }
  onContentEditorMouseUp(event): void {
    // TBD.
  }
  onContentEditorDrop(event): void {
    // TBD
  }
  onContentEditorPaste(event): void {
    // TBD.
  }

  refreshControls() {
    // Update preview
    // const markdownText: string = readElementText(this.erContentEditor.nativeElement);
    // if (markdownText.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '') === '') {
    //   this.erContentEditor.nativeElement.children[0].innerHTML = '';
    //   return;
    // }

    // this.markdownValue = markdownText;

    this.markdownValue = this.erContentEditor.nativeElement.innerText;

    // // clearTimeout(this.mdTimeoutId);
    // const renderStartTime = new Date().getTime();
    // // const markdownText = getText(vditor.editor.element);
    // const html = await md2htmlByVditor(markdownText, vditor);
    // this.element.children[0].innerHTML = html;
    // this.afterRender(vditor, renderStartTime);
  }

  // Math dialog
  onMathDialogInput(event): void {
    // Math dialog
    if (event) {
      const dialogelem: HTMLElement = document.getElementById('acme_math_dialog');
      const inputelem = dialogelem.getElementsByClassName('acme_math_input')[0] as HTMLDivElement;
      const previewelem = dialogelem.getElementsByClassName('acme_math_preview')[0] as HTMLDivElement;
      if (inputelem.innerText) {
        // const orginput = '$$' + inputelem.innerText + '$$';
        const orginput = inputelem.innerText;
        katex.render(orginput, previewelem);
      }
    }
  }
  onMathDialogClose(): void {
    const dialogelem: HTMLElement = document.getElementById('acme_math_dialog');
    const inputelem = dialogelem.getElementsByClassName('acme_math_input')[0] as HTMLDivElement;
    if (inputelem.innerText) {
      const newelem: HTMLElement = document.createElement('div');
      katex.render(inputelem.innerText, newelem);
      this.erContentEditor.nativeElement.appendChild(newelem);
    }

    this.isDialogMathOpen = false;
  }
  validate(control: AbstractControl): ValidationErrors | null {
    return null;
  }
  registerOnValidatorChange?(fn: () => void): void {
    // throw new Error("Method not implemented.");
  }

}
