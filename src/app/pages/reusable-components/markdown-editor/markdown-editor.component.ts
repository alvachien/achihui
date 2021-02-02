import { Component, OnInit, ViewChild, ElementRef, Input, OnDestroy, forwardRef, HostListener, Output,
  EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormControl,
  Validator, Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { KatexOptions } from 'ngx-markdown';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';
import * as moment from 'moment';
import { Observable, Observer } from 'rxjs';
import { editor } from 'monaco-editor';

// tslint:disable-next-line no-any
declare const monaco: any;

import { ModelUtility, ConsoleLogTypeEnum } from '../../../model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services';

@Component({
  // tslint:disable-next-line: component-selector
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
  @Input() editorID: string;
  @ViewChild('previewElement', {static: true}) previewElement: ElementRef;

  editor: editor.ICodeEditor; // | editor.IEditor;
  content: string;
  readOnly = false;
  uploadAPI: string;

  public katexOptions: KatexOptions = {
    // displayMode: true,
    throwOnError: false,
    errorColor: '#cc0000',
  };

  get uploadHeader(): any {
    return {
      Accept: 'application/json',
      Authorization: 'Bearer ' + this.authService.authSubject.getValue().getAccessToken()
    };
  }

  // tslint:disable-next-line:variable-name
  private _onChange: (val: any) => void;
  // tslint:disable-next-line:variable-name
  private _onTouched: () => void;

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

  constructor(private changeDetect: ChangeDetectorRef,
              private authService: AuthService, ) {
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
  }

  onEditorInit(e: any): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onEditorInit...',
      ConsoleLogTypeEnum.debug);

    this.editor = e;
    this.editor.setModel(monaco.editor.createModel('Enjoy writing', 'markdown'));
    this.setEditorReadOnly();
    if (this.content) {
      this.editor.setValue(this.content);
    }

    this.editor.onDidChangeModelContent(ec => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onEditorInit/onDidChangeModelContent...',
        ConsoleLogTypeEnum.debug);

      this.content = this.editor.getValue();
      this.changeDetect.detectChanges();

      this.onChange();
    });

    this.editor.onDidScrollChange(ec => {
      ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onDidScrollChange...',
        ConsoleLogTypeEnum.debug);

      // Rework for the scroll
      if (ec.scrollTop === 0) {
          if (this.previewElement) {
            this.previewElement.nativeElement.scrollTop = 0;
          }
        } else {
          const percent = ec.scrollTop / ec.scrollHeight;

          this.previewElement.nativeElement.scrollTop = percent * this.previewElement.nativeElement.scrollHeight;
        }
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
      const opt = this.editor.getRawOptions();
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
      const curmodel = this.editor.getModel();
      const cursels = this.editor.getSelections();
      if (curmodel) {
        const arrst: editor.IIdentifiedSingleEditOperation[] = [];
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

    if (this.editor) {
      const curmodel = this.editor.getModel();
      const cursels = this.editor.getSelections();
      if (curmodel) {
        const arrst: editor.IIdentifiedSingleEditOperation[] = [];
        cursels.forEach(sel => {
          arrst.push({
            range: sel,
            text: '~~' + curmodel.getValueInRange(sel) + '~~',
          });
        });
        curmodel.pushEditOperations(cursels, arrst, undefined);
      }

      this.editor.focus();
    }
  }
  onToolbarItalic(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarItalic...',
      ConsoleLogTypeEnum.debug);

    if (this.editor) {
      const curmodel = this.editor.getModel();
      const cursels = this.editor.getSelections();
      if (curmodel) {
        const arrst: editor.IIdentifiedSingleEditOperation[] = [];
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
      const curmodel = this.editor.getModel();
      const cursels = this.editor.getSelections();
      if (curmodel) {
        const arrst: editor.IIdentifiedSingleEditOperation[] = [];
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
      const curmodel = this.editor.getModel();
      const cursels = this.editor.getSelections();
      if (curmodel) {
        const arrst: editor.IIdentifiedSingleEditOperation[] = [];
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
      const curmodel = this.editor.getModel();
      const cursels = this.editor.getSelections();
      if (curmodel) {
        const arrst: editor.IIdentifiedSingleEditOperation[] = [];
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
      const curmodel = this.editor.getModel();
      const cursels = this.editor.getSelections();
      if (curmodel) {
        const arrst: editor.IIdentifiedSingleEditOperation[] = [];
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
      const curmodel = this.editor.getModel();
      const cursels = this.editor.getSelections();
      if (curmodel) {
        const arrst: editor.IIdentifiedSingleEditOperation[] = [];
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
      const curmodel = this.editor.getModel();
      const cursels = this.editor.getSelections();
      if (curmodel) {
        const arrst: editor.IIdentifiedSingleEditOperation[] = [];
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
      const curmodel = this.editor.getModel();
      const cursels = this.editor.getSelections();
      if (curmodel) {
        const arrst: editor.IIdentifiedSingleEditOperation[] = [];
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
    if (this.editor) {
      const curmodel = this.editor.getModel();
      const cursels = this.editor.getSelections();
      if (curmodel) {
        const arrst: editor.IIdentifiedSingleEditOperation[] = [];
        cursels.forEach(sel => {
          arrst.push({
            range: sel,
            text: '- \n' + curmodel.getValueInRange(sel),
          });
        });
        curmodel.pushEditOperations(cursels, arrst, undefined);
      }

      this.editor.focus();
    }
  }
  onToolbarOrderedList(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarOrderedList...',
      ConsoleLogTypeEnum.debug);
    if (this.editor) {
      const curmodel = this.editor.getModel();
      const cursels = this.editor.getSelections();
      if (curmodel) {
        const arrst: editor.IIdentifiedSingleEditOperation[] = [];
        cursels.forEach(sel => {
          arrst.push({
            range: sel,
            text: '1. ' + curmodel.getValueInRange(sel),
          });
        });
        curmodel.pushEditOperations(cursels, arrst, undefined);
      }

      this.editor.focus();
    }
  }
  onToolbarCode(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarCode...',
      ConsoleLogTypeEnum.debug);
    if (this.editor) {
      const curmodel = this.editor.getModel();
      const cursels = this.editor.getSelections();
      if (curmodel) {
        const arrst: editor.IIdentifiedSingleEditOperation[] = [];
        cursels.forEach(sel => {
          arrst.push({
            range: sel,
            text: '` ' + curmodel.getValueInRange(sel) + ' `',
          });
        });
        curmodel.pushEditOperations(cursels, arrst, undefined);
      }

      this.editor.focus();
    }
  }
  onToolbarCodeBlock(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarCodeBlock...',
      ConsoleLogTypeEnum.debug);

    if (this.editor) {
      const curmodel = this.editor.getModel();
      const cursels = this.editor.getSelections();
      if (curmodel) {
        const arrst: editor.IIdentifiedSingleEditOperation[] = [];
        cursels.forEach(sel => {
          arrst.push({
            range: sel,
            text: '``` \n' + curmodel.getValueInRange(sel) + '\n ```',
          });
        });
        curmodel.pushEditOperations(cursels, arrst, undefined);
      }

      this.editor.focus();
    }
  }
  onToolbarTex(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarTex...',
      ConsoleLogTypeEnum.debug);
  }
  onToolbarPageBreak(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarPageBreak...',
      ConsoleLogTypeEnum.debug);
    if (this.editor) {
      const curmodel = this.editor.getModel();
      const cursels = this.editor.getSelections();
      if (curmodel) {
        const arrst: editor.IIdentifiedSingleEditOperation[] = [];
        cursels.forEach(sel => {
          arrst.push({
            range: sel,
            text: `---
              ` + curmodel.getValueInRange(sel),
          });
        });
        curmodel.pushEditOperations(cursels, arrst, undefined);
      }

      this.editor.focus();
    }
  }
  onToolbarPicture(filename?: string): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarPageBreak...',
      ConsoleLogTypeEnum.debug);

    // Upload
    if (this.editor) {
      const curmodel = this.editor.getModel();
      const cursels = this.editor.getSelections();
      if (curmodel) {
        const arrst: editor.IIdentifiedSingleEditOperation[] = [];
        if (filename) {
          cursels.forEach(sel => {
            arrst.push({
              range: sel,
              text: '![Image](' + environment.ApiUrl + filename + ')',
            });
          });
          curmodel.pushEditOperations(cursels, arrst, undefined);
        } else {
          cursels.forEach(sel => {
            arrst.push({
              range: sel,
              text: '![Image]()',
            });
          });
          curmodel.pushEditOperations(cursels, arrst, undefined);
        }
      }

      this.editor.focus();
    }
  }
  onToolbarClear(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarClear...',
      ConsoleLogTypeEnum.debug);
    if (this.editor) {
      this.editor.setValue('');

      this.editor.focus();
    }
  }
  beforeUpload(file: File) {
    return new Observable((observer: Observer<boolean>) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        // TBD
        // this.msg.error('You can only upload JPG file!');
        observer.complete();
        return;
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        // TBD.
        // this.msg.error('Image must smaller than 2MB!');
        observer.complete();
        return;
      }

      observer.next(isJpgOrPng && isLt2M);
      observer.complete();
    });
  }
  onToolbarPictureUpload(info: NzUploadChangeParam): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarDateTime...',
      ConsoleLogTypeEnum.debug);
    if (info.file.status === 'done') {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarPictureUpload, succeed`,
        ConsoleLogTypeEnum.debug);
      if (info.file.response) {
        this.onToolbarPicture(info.file.response[0].url);
      }
    } else if (info.file.status === 'error') {
      ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Entering MarkdownEditorComponent onToolbarPictureUpload, failed: ${info.file.response}`,
        ConsoleLogTypeEnum.error);
      // TBD.
      // this.msg.error(`${info.file.name} file upload failed.`);
    }
  }
  onToolbarDateTime(): void {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering MarkdownEditorComponent onToolbarDateTime...',
      ConsoleLogTypeEnum.debug);
    if (this.editor) {
      const curmodel = this.editor.getModel();
      const cursels = this.editor.getSelections();
      if (curmodel) {
        const arrst: editor.IIdentifiedSingleEditOperation[] = [];
        cursels.forEach(sel => {
          arrst.push({
            range: sel,
            text: curmodel.getValueInRange(sel) + moment().toString(),
          });
        });
        curmodel.pushEditOperations(cursels, arrst, undefined);
      }

      this.editor.focus();
    }
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
