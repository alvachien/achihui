import { Component, OnInit, ViewChild, ElementRef, Input, OnDestroy, forwardRef, HostListener, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormControl,
  Validator, Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { insertTextIntoElement, scrollToElementCenter, readElementText, } from 'actslib';
import * as marked from 'marked';
import * as highlightjs from 'highlight.js';
import * as katex from 'katex';
import * as codemirror from 'codemirror';

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
export interface IACMEditorConfig extends codemirror.EditorConfiguration {
  toolbarItems?: EditorToolbarButtonEnum[];
  height?: number | string;
  width?: number | string;
  maxLength?: number;
  readOnly?: boolean;
  placeHolder?: string;
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
  @Input() config: IACMEditorConfig;
  @Output() contentChanged: EventEmitter<string> = new EventEmitter();

  isDialogMathOpen = false;
  mathDialogInput: string;
  instanceCodeMirror: codemirror.EditorFromTextArea = null;
  instanceKatex: any = null;
  instanceMarked: any = null;

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
    // this.toolbarItems = [];
    // if (this.config && this.config.toolbarItems) {
    //   this.config.toolbarItems.forEach((value: EditorToolbarButtonEnum) => {
    //     this.toolbarItems.push(value);
    //   });
    // } else {
    //   this.toolbarItems.push(...this.defaultToolbarItems);
    // }

    // Width and height
    // if (this.config.width) {
    //   this.erContentEditor.nativeElement.style.width = this.config.width + 'px';
    //   this.erContentPreview.nativeElement.style.width = this.config.width + 'px';
    // }
    // if (this.config.height) {
    //   this.erContentEditor.nativeElement.style.height = this.config.height + 'px';
    //   this.erContentPreview.nativeElement.style.height = this.config.height + 'px';
    // }

    let cmOptions: codemirror.EditorConfiguration = {
      mode: 'gfm',
      autofocus: true,
      readOnly: this.config.readOnly,
    };
    this.instanceCodeMirror = codemirror.fromTextArea(this.erTextArea.nativeElement as HTMLTextAreaElement, cmOptions);

    let markedOption: marked.MarkedOptions = {

    };
    this.instanceMarked = new marked.Renderer();
    this.instanceMarked.emoji = (text: string) => {
      text = text.replace(/(\d{1,2}:\d{1,2}:\d{1,2})/g, $1 => {
        return $1.replace(/:/g, "&#58;");
      });
      
      var matchs = text.match(/:([\w\+-]+):/g);
      if (!matchs) {
        return text;
      }

      for (let i = 0, len = matchs.length; i < len; i++) {
        if (matchs[i] === ":+1:") {
          matchs[i] = ":\\+1:";
        }

        text = text.replace(new RegExp(matchs[i]), ($1 : string) => {
          var faMatchs = $1.match(/:(fa-([\w]+)(-(\w+)){0,}):/g);
          var name     = $1.replace(/:/g, "");

          if (faMatchs) {
            for (let fa = 0, len1 = faMatchs.length; fa < len1; fa++) {
              let faName = faMatchs[fa].replace(/:/g, "");
              return "<i class=\"fa " + faName + " fa-emoji\" title=\"" + faName.replace("fa-", "") + "\"></i>";
            }
          } else {
            // var twemojiMatchs = $1.match(/:(tw-([\w]+)-?(\w+)?):/g);
            // if (twemojiMatchs) {
            //   for (let t = 0, len3 = twemojiMatchs.length; t < len3; t++) {
            //     let twe = twemojiMatchs[t].replace(/:/g, "").replace("tw-", "");
            //     return "<img src=\"" + editormd.twemoji.path + twe + editormd.twemoji.ext + "\" title=\"twemoji-" + twe + "\" alt=\"twemoji-" + twe + "\" class=\"emoji twemoji\" />";
            //   }
            // } else {
            //   var src = (name === "+1") ? "plus1" : name;
            //   src     = (src === "black_large_square") ? "black_square" : src;
            //   src     = (src === "moon") ? "waxing_gibbous_moon" : src;

            //   return "<img src=\"" + editormd.emoji.path + src + editormd.emoji.ext + "\" class=\"emoji\" title=\"&#58;" + name + "&#58;\" alt=\"&#58;" + name + "&#58;\" />";
            // }
          }
        });
      }

      return text;
    };

    this.instanceMarked.atLink = this.markedRender_AtLink;          
    this.instanceMarked.link = this.markedRender_Link;  
    this.instanceMarked.heading = this.markedRender_Heading;  
    this.instanceMarked.pageBreak = this.markedRender_PageBreak;
    this.instanceMarked.paragraph = this.markedRender_Paragraph;
    this.instanceMarked.code = this.markedRender_Code;
    this.instanceMarked.tablecell = this.markedRender_Tablecell;
    this.instanceMarked.listitem = this.markedRender_ListItem;

    const markedRender = new marked.Renderer();
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
    // this.erContentEditor.nativeElement.innerHTML = val as string;
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

  ///
  /// Toolbar events
  ///
  onToolbarUndo(): void {
    if (this.instanceCodeMirror) {
      this.instanceCodeMirror.undo();
    }
  }
  onToolbarRedo(): void {
    if (this.instanceCodeMirror) {
      this.instanceCodeMirror.redo();
    }
  }
  onToolbarBold(): void {
    if (this.instanceCodeMirror) {
      let cursor    = this.instanceCodeMirror.getCursor();
      let selection = this.instanceCodeMirror.getSelection();
  
      this.instanceCodeMirror.replaceSelection('**' + selection + '**');
  
      if(selection === '') {
        this.instanceCodeMirror.setCursor(cursor.line, cursor.ch + 2);
      } 
    }
  }
  onToolbarStrikethrough(): void {
    if (this.instanceCodeMirror) {
      let cursor    = this.instanceCodeMirror.getCursor();
      let selection = this.instanceCodeMirror.getSelection();

      this.instanceCodeMirror.replaceSelection('~~' + selection + '~~');

      if(selection === '') {
        this.instanceCodeMirror.setCursor(cursor.line, cursor.ch + 2);
      }
    }
  }
  onToolbarItalic(): void {
    if (this.instanceCodeMirror) {
      let cursor    = this.instanceCodeMirror.getCursor();
      let selection = this.instanceCodeMirror.getSelection();

      this.instanceCodeMirror.replaceSelection('*' + selection + '*');

      if(selection === '') {
        this.instanceCodeMirror.setCursor(cursor.line, cursor.ch + 1);
      }
    }
  }
  onToolbarQuote(): void {
    if (this.instanceCodeMirror) {
      let cursor    = this.instanceCodeMirror.getCursor();
      let selection = this.instanceCodeMirror.getSelection();

      if (cursor.ch !== 0) {
        this.instanceCodeMirror.setCursor(cursor.line, 0);
        this.instanceCodeMirror.replaceSelection('> ' + selection);
        this.instanceCodeMirror.setCursor(cursor.line, cursor.ch + 2);
      } else {
        this.instanceCodeMirror.replaceSelection('> ' + selection);
      }
    }
  }
  onToolbarUpperCase(): void {
    if (this.instanceCodeMirror) {
      let selection = this.instanceCodeMirror.getSelection();
      let selections = this.instanceCodeMirror.listSelections();

      this.instanceCodeMirror.replaceSelection(selection.toUpperCase());
      this.instanceCodeMirror.setSelections(selections);
    }
  }
  onToolbarLowerCase(): void {
    if (this.instanceCodeMirror) {
      let selection = this.instanceCodeMirror.getSelection();
      let selections = this.instanceCodeMirror.listSelections();

      this.instanceCodeMirror.replaceSelection(selection.toLowerCase());
      this.instanceCodeMirror.setSelections(selections);
    }
  }
  onToolbarHr(): void {
    if (this.instanceCodeMirror) {
      let cursor    = this.instanceCodeMirror.getCursor();
      let selection = this.instanceCodeMirror.getSelection();

      this.instanceCodeMirror.replaceSelection(((cursor.ch !== 0) ? '\n\n' : '\n') + '------------\n\n');
    }
  }
  onToolbarH1(): void {
    if (this.instanceCodeMirror) {
      let cursor    = this.instanceCodeMirror.getCursor();
      let selection = this.instanceCodeMirror.getSelection();

      if (cursor.ch !== 0) {
        this.instanceCodeMirror.setCursor(cursor.line, 0);
        this.instanceCodeMirror.replaceSelection('# ' + selection);
        this.instanceCodeMirror.setCursor(cursor.line, cursor.ch + 2);
      } else {
        this.instanceCodeMirror.replaceSelection('# ' + selection);
      }
    }
  }
  onToolbarH2(): void {
    if (this.instanceCodeMirror) {
      let cursor    = this.instanceCodeMirror.getCursor();
      let selection = this.instanceCodeMirror.getSelection();

      if (cursor.ch !== 0) {
        this.instanceCodeMirror.setCursor(cursor.line, 0);
        this.instanceCodeMirror.replaceSelection('## ' + selection);
        this.instanceCodeMirror.setCursor(cursor.line, cursor.ch + 3);
      } else {
        this.instanceCodeMirror.replaceSelection('## ' + selection);
      }
    }
  }
  onToolbarH3(): void {
    if (this.instanceCodeMirror) {
      let cursor    = this.instanceCodeMirror.getCursor();
      let selection = this.instanceCodeMirror.getSelection();

      if (cursor.ch !== 0) {
        this.instanceCodeMirror.setCursor(cursor.line, 0);
        this.instanceCodeMirror.replaceSelection('### ' + selection);
        this.instanceCodeMirror.setCursor(cursor.line, cursor.ch + 4);
      } else {
        this.instanceCodeMirror.replaceSelection('### ' + selection);
      }
    }
  }
  onToolbarH4(): void {
    if (this.instanceCodeMirror) {
      let cursor    = this.instanceCodeMirror.getCursor();
      let selection = this.instanceCodeMirror.getSelection();

      if (cursor.ch !== 0) {
        this.instanceCodeMirror.setCursor(cursor.line, 0);
        this.instanceCodeMirror.replaceSelection('#### ' + selection);
        this.instanceCodeMirror.setCursor(cursor.line, cursor.ch + 5);
      } else {
        this.instanceCodeMirror.replaceSelection('#### ' + selection);
      }
    }    
  }
  onToolbarH5(): void {
    if (this.instanceCodeMirror) {
      let cursor    = this.instanceCodeMirror.getCursor();
      let selection = this.instanceCodeMirror.getSelection();

      if (cursor.ch !== 0) {
        this.instanceCodeMirror.setCursor(cursor.line, 0);
        this.instanceCodeMirror.replaceSelection('##### ' + selection);
        this.instanceCodeMirror.setCursor(cursor.line, cursor.ch + 6);
      } else {
        this.instanceCodeMirror.replaceSelection('##### ' + selection);
      }
    }    
  }
  onToolbarH6(): void {
    if (this.instanceCodeMirror) {
      let cursor    = this.instanceCodeMirror.getCursor();
      let selection = this.instanceCodeMirror.getSelection();

      if (cursor.ch !== 0) {
        this.instanceCodeMirror.setCursor(cursor.line, 0);
        this.instanceCodeMirror.replaceSelection('###### ' + selection);
        this.instanceCodeMirror.setCursor(cursor.line, cursor.ch + 7);
      } else {
        this.instanceCodeMirror.replaceSelection('###### ' + selection);
      }
    }    
  }
  onToolbarUnorderedList(): void {
    if (this.instanceCodeMirror) {
      let cursor    = this.instanceCodeMirror.getCursor();
      let selection = this.instanceCodeMirror.getSelection();

      if (selection === '') {
        this.instanceCodeMirror.replaceSelection('- ' + selection);
      } else {
        let selectionText = selection.split('\n');

        for (let i = 0, len = selectionText.length; i < len; i++) {
          selectionText[i] = (selectionText[i] === '') ? '' : '- ' + selectionText[i];
        }

        this.instanceCodeMirror.replaceSelection(selectionText.join('\n'));
      }
    }
  }
  onToolbarOrderedList(): void {
    if (this.instanceCodeMirror) {
      let cursor    = this.instanceCodeMirror.getCursor();
      let selection = this.instanceCodeMirror.getSelection();
      if(selection === '') {
        this.instanceCodeMirror.replaceSelection('1. ' + selection);
      } else {
        let selectionText = selection.split('\n');

        for (let i = 0, len = selectionText.length; i < len; i++) {
          selectionText[i] = (selectionText[i] === '') ? '' : (i+1) + '. ' + selectionText[i];
        }

        this.instanceCodeMirror.replaceSelection(selectionText.join('\n'));
      }
    }
  }
  onToolbarCode(): void {
    if (this.instanceCodeMirror) {
      let cursor    = this.instanceCodeMirror.getCursor();
      let selection = this.instanceCodeMirror.getSelection();
      this.instanceCodeMirror.replaceSelection('`' + selection + '`');

      if (selection === '') {
        this.instanceCodeMirror.setCursor(cursor.line, cursor.ch + 1);
      }
    }
  }
  onToolbarCodeBlock(): void {
    if (this.instanceCodeMirror) {
      let cursor    = this.instanceCodeMirror.getCursor();
      let selection = this.instanceCodeMirror.getSelection();
      this.instanceCodeMirror.replaceSelection('`' + selection + '`');

      if (selection === '') {
        this.instanceCodeMirror.setCursor(cursor.line, cursor.ch + 1);
      }
    }
  }
  onToolbarTex(): void {
    if (this.instanceCodeMirror) {
      let cursor    = this.instanceCodeMirror.getCursor();
      let selection = this.instanceCodeMirror.getSelection();
      this.instanceCodeMirror.replaceSelection('$$' + selection + '$$');

      if (selection === '') {
        this.instanceCodeMirror.setCursor(cursor.line, cursor.ch + 2);
      }
    }
  }
  onToolbarPageBreak(): void {
    if (this.instanceCodeMirror) {
      let selection = this.instanceCodeMirror.getSelection();
      this.instanceCodeMirror.replaceSelection('\r\n[========]\r\n');
    }
  }
  onToolbarDateTime(): void {
    if (this.instanceCodeMirror) {
      let selection = this.instanceCodeMirror.getSelection();

      let date      = new Date();
      let datefmt = date.toLocaleString();
      // let langName  = this.settings.lang.name;
      // var datefmt   = editormd.dateFormat() + " " + editormd.dateFormat((langName === "zh-cn" || langName === "zh-tw") ? "cn-week-day" : "week-day");

      this.instanceCodeMirror.replaceSelection(datefmt);
    }
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
