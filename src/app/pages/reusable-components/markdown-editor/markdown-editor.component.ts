import { Component, OnInit, ViewChild, ElementRef, Input, OnDestroy, forwardRef, HostListener, Output, 
  EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormControl,
  Validator, Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { KatexOptions } from 'ngx-markdown';
import { UploadChangeParam } from 'ng-zorro-antd/upload';
// tslint:disable-next-line no-any
declare const monaco: any;

import { ModelUtility, ConsoleLogTypeEnum, UIMode } from '../../../model';
import { editor } from 'monaco-editor';
import { environment } from '../../../../environments/environment';

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
  @Input() config: IACMEditorConfig;
  @Input() editorID: string;

  isDialogMathOpen = false;
  mathDialogInput: string;
  editor: editor.ICodeEditor;
  content: string;
  readOnly: boolean = false;
  uploadAPI: string;

  stateWatching = false;
  stateLoaded   = false;
  statePreview  = false;
  stateFullscreen = false;
  public options: KatexOptions = {
    displayMode: true,
    throwOnError: false,
    errorColor: '#cc0000',
  };

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

  get value(): string {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent value getter...',
      ConsoleLogTypeEnum.debug);
    if (this.editor) {
      this.content = this.editor.getValue();
    }

    return this.content || '';
  }
  set value(value: string) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent value setter...',
      ConsoleLogTypeEnum.debug);
    this.content = value;
    if (this.editor) {
      this.editor.setValue(this.content);
    }

    if (this._onChange) {
      this._onChange(value);
    }
  }

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

  @HostListener('change') onChange(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onChange...',
      ConsoleLogTypeEnum.debug);

    if (this._onChange) {
      this._onChange(this.value);
    }
  }
  @HostListener('blur') onTouched(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onTouched...',
      ConsoleLogTypeEnum.debug);

    if (this._onTouched) {
      this._onTouched();
    }
  }

  constructor(private changeDetect: ChangeDetectorRef) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent constructor...',
      ConsoleLogTypeEnum.debug);

    this.uploadAPI = environment.ApiUrl + '/api/PhotoFile';
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
    this.editor.setModel(monaco.editor.createModel('Enjoy writing', 'markdown'));
    this.setEditorReadOnly();
    if (this.content) {
      this.editor.setValue(this.content);
    }

    this.editor.onDidChangeModelContent(e => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onEditorInit/onDidChangeModelContent...',
        ConsoleLogTypeEnum.debug);

      this.content = this.editor.getValue();
      this.changeDetect.detectChanges();

      this.onChange();
    });
    // this.editor.onDidChangeCursorPosition(e => {
    //   ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onEditorInit, onDidChangeCursorPosition...',
    //     ConsoleLogTypeEnum.debug);

    //   let npos = this.editor.getPosition();
    //   // this.editor.getnpos.lineNumber
    //   console.log(npos);
    // });
    // this.editor.onDidChangeCursorSelection(e => {
    //   ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onEditorInit, onDidChangeCursorSelection...',
    //     ConsoleLogTypeEnum.debug);

    //   let nsel = this.editor.getSelection();
    //   console.log(nsel);
    // });
    this.editor.onDidScrollChange(e => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onDidScrollChange...',
        ConsoleLogTypeEnum.debug);

        // Rework for the scroll
        // TBD.
        // console.log(e.scrollHeight);
    });
  }

  writeValue(val: any): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent writeValue...',
      ConsoleLogTypeEnum.debug);
    
    this.value = val;
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
      this.readOnly = true;
    } else {
      this.readOnly = false;
    }
    this.setEditorReadOnly();
  }
  setEditorReadOnly(): void {
    if (this.editor) {
      let opt = this.editor.getRawOptions();
      opt.readOnly = this.readOnly;
      this.editor.updateOptions(opt);
    }
  }

  ///
  /// Toolbar events
  ///
  onToolbarUndo(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarUndo...',
      ConsoleLogTypeEnum.debug);
    if (this.editor) {
    }
  }
  onToolbarRedo(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarRedo...',
      ConsoleLogTypeEnum.debug);
    if (this.editor) {      
    }
  }
  onToolbarBold(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarBold...',
      ConsoleLogTypeEnum.debug);
    if (this.editor) {
      let curmodel = this.editor.getModel();
      let cursels = this.editor.getSelections();
      if (curmodel) {
        let arrst: editor.IIdentifiedSingleEditOperation[] = [];
        cursels.forEach(sel => {
          arrst.push({
            range: sel,
            text: '**' + curmodel.getValueInRange(sel) + '**',
          });
        });
        curmodel.pushEditOperations(cursels, arrst, undefined);
      }

      this.editor.focus();
    }
  }
  onToolbarStrikethrough(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarStrikethrough...',
      ConsoleLogTypeEnum.debug);

  }
  onToolbarItalic(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarItalic...',
      ConsoleLogTypeEnum.debug);

    if (this.editor) {
      let curmodel = this.editor.getModel();
      let cursels = this.editor.getSelections();
      if (curmodel) {
        let arrst: editor.IIdentifiedSingleEditOperation[] = [];
        cursels.forEach(sel => {
          arrst.push({
            range: sel,
            text: '*' + curmodel.getValueInRange(sel) + '*',
          });
        });
        curmodel.pushEditOperations(cursels, arrst, undefined);
      }

      this.editor.focus();
    }
  }
  onToolbarQuote(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarQuote...',
      ConsoleLogTypeEnum.debug);
    if (this.editor) {
      let curmodel = this.editor.getModel();
      let cursels = this.editor.getSelections();
      if (curmodel) {
        let arrst: editor.IIdentifiedSingleEditOperation[] = [];
        cursels.forEach(sel => {
          arrst.push({
            range: sel,
            text: '> ' + curmodel.getValueInRange(sel),
          });
        });
        curmodel.pushEditOperations(cursels, arrst, undefined);
      }

      this.editor.focus();
    }
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

    if (this.editor) {
      let curmodel = this.editor.getModel();
      let cursels = this.editor.getSelections();
      if (curmodel) {
        let arrst: editor.IIdentifiedSingleEditOperation[] = [];
        cursels.forEach(sel => {
          arrst.push({
            range: sel,
            text: '# ' + curmodel.getValueInRange(sel),
          });
        });
        curmodel.pushEditOperations(cursels, arrst, undefined);
      }

      this.editor.focus();
    }  
  }
  onToolbarH2(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarH2...',
      ConsoleLogTypeEnum.debug);

    if (this.editor) {
      let curmodel = this.editor.getModel();
      let cursels = this.editor.getSelections();
      if (curmodel) {
        let arrst: editor.IIdentifiedSingleEditOperation[] = [];
        cursels.forEach(sel => {
          arrst.push({
            range: sel,
            text: '## ' + curmodel.getValueInRange(sel),
          });
        });
        curmodel.pushEditOperations(cursels, arrst, undefined);
      }

      this.editor.focus();
    }  
  }
  onToolbarH3(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarH3...',
      ConsoleLogTypeEnum.debug);

    if (this.editor) {
      let curmodel = this.editor.getModel();
      let cursels = this.editor.getSelections();
      if (curmodel) {
        let arrst: editor.IIdentifiedSingleEditOperation[] = [];
        cursels.forEach(sel => {
          arrst.push({
            range: sel,
            text: '### ' + curmodel.getValueInRange(sel),
          });
        });
        curmodel.pushEditOperations(cursels, arrst, undefined);
      }

      this.editor.focus();
    }  
  }
  onToolbarH4(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarH4...',
      ConsoleLogTypeEnum.debug);

    if (this.editor) {
      let curmodel = this.editor.getModel();
      let cursels = this.editor.getSelections();
      if (curmodel) {
        let arrst: editor.IIdentifiedSingleEditOperation[] = [];
        cursels.forEach(sel => {
          arrst.push({
            range: sel,
            text: '#### ' + curmodel.getValueInRange(sel),
          });
        });
        curmodel.pushEditOperations(cursels, arrst, undefined);
      }

      this.editor.focus();
    }
  }
  onToolbarH5(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarH5...',
      ConsoleLogTypeEnum.debug);

    if (this.editor) {
      let curmodel = this.editor.getModel();
      let cursels = this.editor.getSelections();
      if (curmodel) {
        let arrst: editor.IIdentifiedSingleEditOperation[] = [];
        cursels.forEach(sel => {
          arrst.push({
            range: sel,
            text: '##### ' + curmodel.getValueInRange(sel),
          });
        });
        curmodel.pushEditOperations(cursels, arrst, undefined);
      }

      this.editor.focus();
    }  
  }
  onToolbarH6(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarH6...',
      ConsoleLogTypeEnum.debug);

    if (this.editor) {
      let curmodel = this.editor.getModel();
      let cursels = this.editor.getSelections();
      if (curmodel) {
        let arrst: editor.IIdentifiedSingleEditOperation[] = [];
        cursels.forEach(sel => {
          arrst.push({
            range: sel,
            text: '###### ' + curmodel.getValueInRange(sel),
          });
        });
        curmodel.pushEditOperations(cursels, arrst, undefined);
      }

      this.editor.focus();
    }  
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
  onToolbarPicture(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarPageBreak...',
      ConsoleLogTypeEnum.debug);
    // Upload
  }
  onToolbarPictureUpload(info: UploadChangeParam): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarDateTime...',
      ConsoleLogTypeEnum.debug);
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      // this.msg.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      // this.msg.error(`${info.file.name} file upload failed.`);
    }
  }
  onToolbarDateTime(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarDateTime...',
      ConsoleLogTypeEnum.debug);
  }
  onMathDialogInput(event): void {
    // Math dialog
    if (event) {
      const dialogelem: HTMLElement = document.getElementById('acme_math_dialog');
      const inputelem = dialogelem.getElementsByClassName('acme_math_input')[0] as HTMLDivElement;
      const previewelem = dialogelem.getElementsByClassName('acme_math_preview')[0] as HTMLDivElement;
      if (inputelem.innerText) {
        // const orginput = '$$' + inputelem.innerText + '$$';
        const orginput = inputelem.innerText;
        // katex.render(orginput, previewelem);
      }
    }
  }
  onMathDialogClose(): void {
    // const dialogelem: HTMLElement = document.getElementById('acme_math_dialog');
    // const inputelem = dialogelem.getElementsByClassName('acme_math_input')[0] as HTMLDivElement;
    // if (inputelem.innerText) {
    //   const newelem: HTMLElement = document.createElement('div');
    //   katex.render(inputelem.innerText, newelem);
    //   this.erContentEditor.nativeElement.appendChild(newelem);
    // }

    // this.isDialogMathOpen = false;
  }
  validate(control: AbstractControl): ValidationErrors | null {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent validate...',
      ConsoleLogTypeEnum.debug);
    return null;
  }
  registerOnValidatorChange?(fn: () => void): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent registerOnValidatorChange...',
      ConsoleLogTypeEnum.debug);
    // throw new Error("Method not implemented.");
  }
}
