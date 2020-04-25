import { Component, OnInit, ViewChild, ElementRef, Input, OnDestroy, forwardRef, HostListener, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormControl,
  Validator, Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import * as marked from 'marked';
// import * as highlightjs from 'highlight.js';
import * as katex from 'katex';
// tslint:disable-next-line no-any
declare const monaco: any;

import { ModelUtility, ConsoleLogTypeEnum } from '../../../model';
import { editor } from 'monaco-editor';

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
  name?: string;
  height?: number | string;
  width?: number | string;
  delay?: number;
  watch?: boolean;
  maxLength?: number;
  readOnly?: boolean;
  placeHolder?: string;
  gotoLine?: boolean;
  autoHeight?: boolean;
  autoFocus?: boolean;
  autoCloseTags?: boolean;
  searchReplace?: boolean;
  syncScrolling?: boolean;
  autoCloseBrackets?: boolean;
  showTrailingSpace?: boolean;
  matchBrackets?: boolean;
  styleSelectedText?: boolean;
  matchWordHighlight?: boolean;
  styleActiveLine?: boolean;
  dialogShowMask?: boolean;
  dialogDraggable?: boolean;
  dialogMaskBgColor?: any;
  dialogMaskOpacity?: number;
  fontSize?: number | string;
  saveHTMLToTextarea?: boolean;
  imageUpload?: boolean;
  imageFormats?: Array<string>;
  imageUploadURL?: string;
  crossDomainUpload?: boolean;
  uploadCallbackURL?: string;
  toc?: boolean;
  tocm?: boolean;
  tocTitle?: string;
  tocDropdown?: boolean;
  tocContainer?: string;
  tocStartLevel?: number;
  htmlDecode?: boolean;
  pageBreak?: boolean;
  atLink?: boolean;
  emailLink?: boolean;
  taskList?: boolean;
  emoji?: boolean;
  tex?: boolean;
  flowChart?: boolean;
  sequenceDiagram?: boolean;
  previewCodeHighlight?: boolean;
  toolbar?: boolean;
  toolbarAutoFixed?: boolean;
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
  @ViewChild('acme_textarea', { static: true }) erTextArea: ElementRef;
  @ViewChild('acme_preview', { static: true }) erPreview: ElementRef;
  @ViewChild('acme_preview_container', { static: true }) erPreviewContainer: ElementRef;
  @ViewChild('acme_content_editor', { static: true }) erContentEditor: ElementRef;
  // @ViewChild('acme_content_splitter', {static: true}) erContentSplitter: ElementRef;
  @ViewChild('acme_content_preview', { static: true }) erContentPreview: ElementRef;
  @ViewChild('acme_mark', {static: true}) erMask: ElementRef;
  @ViewChild('acme_container_mask', {static: true}) erContainermask: ElementRef;
  @ViewChild('acme_html_textarea', {static: true}) erHtmlTextArea: ElementRef;
  @Input() config: IACMEditorConfig;
  @Output() contentChanged: EventEmitter<string> = new EventEmitter();
  @Input() editorID: string;

  isDialogMathOpen = false;
  mathDialogInput: string;
  instanceKatex: any = null;
  instanceMarked: any = null;
  editor: editor.ICodeEditor;
  content: string;

  stateWatching = false;
  stateLoaded   = false;
  statePreview  = false;
  stateFullscreen = false;

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

  public get value(): any {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent value getter...',
      ConsoleLogTypeEnum.debug);
    return this._markdownValue || '';
  }
  public set value(value: any) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent value setter...',
      ConsoleLogTypeEnum.debug);
    this._markdownValue = value;
    this._onChange(value);
  }
  // tslint:disable-next-line:variable-name
  private _markdownValue: any;
  // tslint:disable-next-line:variable-name
  private _renderMarkTimeout: any;
  // tslint:disable-next-line:variable-name
  private _markedOpt: any;

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
  get IsPreviewCloseButton(): boolean {
    return this.config.readOnly;
  }
  get IsSaveHTMLToMarkdown(): boolean {
    return this.config.saveHTMLToTextarea;
  }

  constructor() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.content = `# Test
      ## Test 2
      `;
  }

  ngOnInit() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent ngOnInit...',
      ConsoleLogTypeEnum.debug);
  }

  ngOnDestroy() {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent ngOnDestroy...',
      ConsoleLogTypeEnum.debug);
    this.toolbarItems = [];
  }

  onEditorInit(e: editor.ICodeEditor): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onEditorInit...',
      ConsoleLogTypeEnum.debug);

    this.editor = e;
    // this.editor.setModel(monaco.editor.createModel("console.log('Hello ng-zorro-antd')", 'typescript'));
  }

  writeValue(val: any): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent writeValue...',
      ConsoleLogTypeEnum.debug);
    // this.erContentEditor.nativeElement.innerHTML = val as string;
  }
  registerOnChange(fn: any): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent registerOnChange...',
      ConsoleLogTypeEnum.debug);
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent registerOnTouched...',
      ConsoleLogTypeEnum.debug);
    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent setDisabledState...',
      ConsoleLogTypeEnum.debug);
    if (isDisabled) {
      this.erWrapper.nativeElement.disable = true;
    } else {
      this.erWrapper.nativeElement.disable = true;
    }
  }

  ///
  /// Toolbar events
  ///
  onToolbarUndo(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarUndo...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarRedo(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarRedo...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarBold(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarBold...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarStrikethrough(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarStrikethrough...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarItalic(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarItalic...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarQuote(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarQuote...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarUpperCase(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarUpperCase...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarLowerCase(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarLowercase...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarHr(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarHr...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarH1(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarH1...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarH2(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarH2...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarH3(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarH3...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarH4(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarH4...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarH5(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarH5...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarH6(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarH6...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarUnorderedList(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarUnorderedList...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarOrderedList(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarOrderedList...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarCode(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarCode...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarCodeBlock(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarCodeBlock...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarTex(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarTex...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarPageBreak(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarPageBreak...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarDateTime(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarDateTime...',
      ConsoleLogTypeEnum.debug);
  }
  // onToolbarButtonClick(event: MouseEvent, btn: string): void {
  //   const titem: EditorToolbarButtonEnum = btn as EditorToolbarButtonEnum;
  //   switch (titem) {
  //     case EditorToolbarButtonEnum.bold:
  //       document.execCommand('bold', false);
  //       this.erContentEditor.nativeElement.focus();
  //       break;

  //     case EditorToolbarButtonEnum.italic:
  //       document.execCommand('italic', false);
  //       this.erContentEditor.nativeElement.focus();
  //       break;

  //     case EditorToolbarButtonEnum.underline:
  //       document.execCommand('underline', false);
  //       this.erContentEditor.nativeElement.focus();
  //       break;

  //     case EditorToolbarButtonEnum.strikethrough:
  //       document.execCommand('strikeThrough', false);
  //       this.erContentEditor.nativeElement.focus();
  //       break;
  //     case EditorToolbarButtonEnum.heading1:
  //       document.execCommand(commandFormatBlock, false, '<h1>');
  //       this.erContentEditor.nativeElement.focus();
  //       break;
  //     case EditorToolbarButtonEnum.heading2:
  //       document.execCommand(commandFormatBlock, false, '<h2>');
  //       this.erContentEditor.nativeElement.focus();
  //       break;
  //     case EditorToolbarButtonEnum.heading3:
  //       document.execCommand(commandFormatBlock, false, '<h3>');
  //       this.erContentEditor.nativeElement.focus();
  //       break;
  //     case EditorToolbarButtonEnum.paragraph:
  //       document.execCommand(commandFormatBlock, false, '<p>');
  //       this.erContentEditor.nativeElement.focus();
  //       break;
  //     case EditorToolbarButtonEnum.quote:
  //       document.execCommand(commandFormatBlock, false, '<blockquote>');
  //       this.erContentEditor.nativeElement.focus();
  //       break;
  //     case EditorToolbarButtonEnum.orderedlist:
  //       document.execCommand('insertOrderedList', false);
  //       this.erContentEditor.nativeElement.focus();
  //       break;
  //     case EditorToolbarButtonEnum.unorderedlist:
  //       document.execCommand('insertUnorderedList', false);
  //       this.erContentEditor.nativeElement.focus();
  //       break;
  //     case EditorToolbarButtonEnum.code:
  //       document.execCommand(commandFormatBlock, false, '<pre>');
  //       this.erContentEditor.nativeElement.focus();
  //       break;
  //     case EditorToolbarButtonEnum.horizontalline:
  //       document.execCommand('insertHorizontalRule', false);
  //       this.erContentEditor.nativeElement.focus();
  //       break;
  //     case EditorToolbarButtonEnum.link:
  //     case EditorToolbarButtonEnum.image:
  //       // TBD.
  //       this.erContentEditor.nativeElement.focus();
  //       break;
  //     case EditorToolbarButtonEnum.math:
  //       this.isDialogMathOpen = true;
  //       this.erContentEditor.nativeElement.focus();
  //       break;

  //     default:
  //       break;
  //   }
  // }

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
    // this.refreshControls();

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

    // this.markdownValue = this.erContentEditor.nativeElement.innerText;

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

  ///
  /// marked render methods
  ///
  private markedRender_AtLink(text: string): string {
    const atLinkReg = /@(\w+)/g;
    const emailReg = /(\w+)@(\w+)\.(\w+)\.?(\w+)?/g;
    const emailLinkReg = /(mailto:)?([\w\.\_]+)@(\w+)\.(\w+)\.?(\w+)?/g;

    if (atLinkReg.test(text)) { 
      // if (settings.atLink) {
      //     text = text.replace(emailReg, function($1, $2, $3, $4) {
      //         return $1.replace(/@/g, "_#_&#64;_#_");
      //     });

      //     text = text.replace(atLinkReg, function($1, $2) {
      //         return "<a href=\"" + editormd.urls.atLinkBase + "" + $2 + "\" title=\"&#64;" + $2 + "\" class=\"at-link\">" + $1 + "</a>";
      //     }).replace(/_#_&#64;_#_/g, "@");
      // }
      
      // if (settings.emailLink) {
        text = text.replace(emailLinkReg, ($1, $2, $3, $4, $5) => {
          return (!$2 && ['jpg', 'jpeg', 'png', 'gif', 'ico', 'icon', 'pdf'].includes($5)) ? '<a href="mailto:' + $1 + '">' + $1 + '</a>' : $1;
        });
      // }

      return text;
    }

    return text;
  }
  private markedRender_Link(href: string, title: string, text: string): string {
    const atLinkReg = /@(\w+)/g;

    // if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href)).replace(/[^\w:]/g,"").toLowerCase();
    } catch(e) {
      return '';
    }

    if (prot.indexOf('javascript:') === 0) {
      return '';
    }
    // }

    let out = '<a href="' + href + '"';  
    if (atLinkReg.test(title) || atLinkReg.test(text)) {
      if (title) {
        out += ' title="' + title.replace(/@/g, '&#64;');
      }
      
      return out + '">' + text.replace(/@/g, '&#64;') + '</a>';
    }

    if (title) {
      out += ' title="' + title + '"';
    }

    out += '>' + text + '</a>';

    return out;
  }
  private markedRender_Heading(text: string, level, raw) {
    let linkText       = text;
    let hasLinkReg     = /\s*\<a\s*href\=\"(.*)\"\s*([^\>]*)\>(.*)\<\/a\>\s*/;
    let getLinkTextReg = /\s*\<a\s*([^\>]+)\>([^\>]*)\<\/a\>\s*/g;

    if (hasLinkReg.test(text)) {
      let tempText = [];
      let subtexts = text.split(/\<a\s*([^\>]+)\>([^\>]*)\<\/a\>/);

      for (var i = 0, len = subtexts.length; i < len; i++) {
        tempText.push(subtexts[i].replace(/\s*href\=\"(.*)\"\s*/g, ''));
      }

      text = tempText.join(' ');
    }
    
    text = text.trim();
    
    var escapedText    = text.toLowerCase().replace(/[^\w]+/g, '-');
    var toc = {
        text  : text,
        level : level,
        slug  : escapedText
    };
    
    var isChinese = /^[\u4e00-\u9fa5]+$/.test(text);
    var id        = (isChinese) ? escape(text).replace(/\%/g, '') : text.toLowerCase().replace(/[^\w]+/g, '-');

    // markdownToC.push(toc);
    
    //var headingHTML = '<h' + level + ' id="h'+ level + '-' + this.options.headerPrefix + id +'">';
    var headingHTML = '<h' + level + '>';
    
    headingHTML    += '<a name="' + text + '" class="reference-link"></a>';
    headingHTML    += '<span class="header-link octicon octicon-link"></span>';
    headingHTML    += (hasLinkReg) ? this.markedRender_AtLink(this.markedRender_Emoji(linkText)) : this.markedRender_AtLink(this.markedRender_Emoji(text));
    headingHTML    += "</h" + level + ">";

    return headingHTML;
  }
  private markedRender_PageBreak(text: string) {
    const pageBreakReg = /^\[[=]{8,}\]$/;
    if (pageBreakReg.test(text) ) { // && settings.pageBreak)
      text = '<hr style="page-break-after:always;" class="page-break editormd-page-break" />';
    }
    
    return text;
  }
  private markedRender_Paragraph(text: string) {
    const pageBreakReg = /^\[[=]{8,}\]$/;
    let isTeXInline     = /\$\$(.*)\$\$/g.test(text);
    let isTeXLine       = /^\$\$(.*)\$\$$/.test(text);
    let isTeXAddClass   = (isTeXLine)     ? ' class="acme-tex"' : '';
    //let isToC           = (settings.tocm) ? /^(\[TOC\]|\[TOCM\])$/.test(text) : /^\[TOC\]$/.test(text);
    let isToC           = /^\[TOC\]$/.test(text);
    let isToCMenu       = /^\[TOCM\]$/.test(text);
    
    if (!isTeXLine && isTeXInline) {
      text = text.replace(/(\$\$([^\$]*)\$\$)+/g, function($1, $2) {
        return '<span class="acme-tex">' + $2.replace(/\$/g, '') + '</span>';
      });
    } else {
      text = (isTeXLine) ? text.replace(/\$/g, '') : text;
    }
    
    var tocHTML = '<div class="markdown-toc acme-markdown-toc">' + text + '</div>';
    
    return (isToC) ? ( (isToCMenu) ? '<div class="acme-toc-menu">' + tocHTML + '</div><br/>' : tocHTML )
                   : ( (pageBreakReg.test(text)) ? this.markedRender_PageBreak(text) : '<p' + isTeXAddClass + '>' + this.markedRender_AtLink(this.markedRender_Emoji(text)) + '</p>\n');
  }
  private markedRender_Code(code: string, lang: string, escaped) { 
    if (lang === 'seq' || lang === 'sequence') {
      return '<div class="sequence-diagram">' + code + '</div>';
    } else if ( lang === 'flow') {
      return '<div class="flowchart">' + code + '</div>';
    } else if ( lang === 'math' || lang === 'latex' || lang === 'katex') {
      return '<p class="acme-tex">' + code + '</p>';
    }
    else {
      return marked.Renderer.prototype.code.apply(this, arguments);
    }
  }
  private markedRender_Tablecell(content: string, flags): string {
    let type = (flags.header) ? 'th' : 'td';
    let tag  = (flags.align)  ? '<' + type + ' style="text-align:' + flags.align + '">' : '<' + type + '>';
    
    return tag + this.markedRender_AtLink(this.markedRender_Emoji(content)) + '</' + type + '>\n';
  }
  private markedRender_ListItem(text): string {
    if (/^\s*\[[x\s]\]\s*/.test(text)) { // if (settings.taskList && /^\s*\[[x\s]\]\s*/.test(text)) 
      text = text.replace(/^\s*\[\s\]\s*/, '<input type="checkbox" class="task-list-item-checkbox" />')
                 .replace(/^\s*\[x\]\s*/,  '<input type="checkbox" class="task-list-item-checkbox" checked disabled />');

      return '<li style="list-style: none;">' + this.markedRender_AtLink(this.markedRender_Emoji(text)) + '</li>';
    } else {
      return '<li>' + this.markedRender_AtLink(this.markedRender_Emoji(text)) + '</li>';
    }
  }
  private markedRender_Emoji(text) {
    const emojidatetimeReg = /(\d{1,2}:\d{1,2}:\d{1,2})/g;
    const emojiReg = /:([\w\+-]+):/g;
    text = text.replace(emojidatetimeReg, $1 => {
      return $1.replace(/:/g, '&#58;');
    });
    
    var matchs = text.match(emojiReg);

    if (!matchs) { // if (!matchs || !settings.emoji) {
      return text;
    }

    // for (let i = 0, len = matchs.length; i < len; i++)
    // {            
    //     if (matchs[i] === ":+1:") {
    //         matchs[i] = ":\\+1:";
    //     }

    //     text = text.replace(new RegExp(matchs[i]), function($1, $2){
    //         var faMatchs = $1.match(faIconReg);
    //         var name     = $1.replace(/:/g, "");

    //         if (faMatchs)
    //         {                        
    //             for (var fa = 0, len1 = faMatchs.length; fa < len1; fa++)
    //             {
    //                 var faName = faMatchs[fa].replace(/:/g, "");
                    
    //                 return "<i class=\"fa " + faName + " fa-emoji\" title=\"" + faName.replace("fa-", "") + "\"></i>";
    //             }
    //         }
    //         else
    //         {
    //             var emdlogoMathcs = $1.match(editormdLogoReg);
    //             var twemojiMatchs = $1.match(twemojiReg);

    //             if (emdlogoMathcs)                                        
    //             {                            
    //                 for (var x = 0, len2 = emdlogoMathcs.length; x < len2; x++)
    //                 {
    //                     var logoName = emdlogoMathcs[x].replace(/:/g, "");
    //                     return "<i class=\"" + logoName + "\" title=\"Editor.md logo (" + logoName + ")\"></i>";
    //                 }
    //             }
    //             else if (twemojiMatchs) 
    //             {
    //                 for (var t = 0, len3 = twemojiMatchs.length; t < len3; t++)
    //                 {
    //                     var twe = twemojiMatchs[t].replace(/:/g, "").replace("tw-", "");
    //                     return "<img src=\"" + editormd.twemoji.path + twe + editormd.twemoji.ext + "\" title=\"twemoji-" + twe + "\" alt=\"twemoji-" + twe + "\" class=\"emoji twemoji\" />";
    //                 }
    //             }
    //             else
    //             {
    //                 var src = (name === "+1") ? "plus1" : name;
    //                 src     = (src === "black_large_square") ? "black_square" : src;
    //                 src     = (src === "moon") ? "waxing_gibbous_moon" : src;

    //                 return "<img src=\"" + editormd.emoji.path + src + editormd.emoji.ext + "\" class=\"emoji\" title=\"&#58;" + name + "&#58;\" alt=\"&#58;" + name + "&#58;\" />";
    //             }
    //         }
    //     });
    // }

    return text;
  }
}
