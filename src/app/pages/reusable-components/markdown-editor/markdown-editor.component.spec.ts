import {
  waitForAsync,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  flush,
  discardPeriodicTasks,
} from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { NzCodeEditorModule } from 'ng-zorro-antd/code-editor';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzConfigService } from 'ng-zorro-antd/core/config';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MarkdownModule } from 'ngx-markdown';
import { BehaviorSubject } from 'rxjs';

import { getTranslocoModule } from '../../../../testing';
import { MarkdownEditorComponent } from './markdown-editor.component';
import { AuthService } from '../../../services';
import { UserAuthInfo } from '../../../../app/model';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@Component({
    template: ` <form [formGroup]="formGrp">
    <nz-form-item>
      <nz-form-control>
        <ac-markdown-editor formControlName="infoControl"></ac-markdown-editor>
      </nz-form-control>
    </nz-form-item>
  </form>`,
    standalone: false
})
export class MarkdownEditorTestFormComponent {
  public formGrp: UntypedFormGroup;
  @ViewChild(MarkdownEditorComponent, { static: true })
  editorComponent?: MarkdownEditorComponent;

  constructor() {
    this.formGrp = new UntypedFormGroup({
      infoControl: new UntypedFormControl(),
    });
  }
}

describe('MarkdownEditorComponent', () => {
  let testingComponent: MarkdownEditorTestFormComponent;
  let fixture: ComponentFixture<MarkdownEditorTestFormComponent>;
  let authServiceStub: Partial<AuthService>;

  beforeAll(() => {
    authServiceStub = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [MarkdownEditorComponent, MarkdownEditorTestFormComponent],
    imports: [getTranslocoModule(),
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        NzResizableModule,
        NzCodeEditorModule,
        NzButtonModule,
        NzIconModule,
        NzFormModule,
        NzDividerModule,
        NzInputModule,
        NzSwitchModule,
        NzLayoutModule,
        NzUploadModule,
        MarkdownModule.forRoot()],
    providers: [NzConfigService, NzModalService, { provide: AuthService, useValue: authServiceStub }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownEditorTestFormComponent);
    testingComponent = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(testingComponent).toBeTruthy();
  });

  describe('edit mode', () => {
    it('edit mode init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(testingComponent).toBeTruthy();
      discardPeriodicTasks();
      flush();
    }));

    it('edit mode for code coverage', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();

      expect(testingComponent).toBeTruthy();
      expect(testingComponent.editorComponent).toBeTruthy();

      if (testingComponent.editorComponent) {
        testingComponent.editorComponent.onToolbarH1();
        testingComponent.editorComponent.onToolbarH2();
        testingComponent.editorComponent.onToolbarH3();
        testingComponent.editorComponent.onToolbarH4();
        testingComponent.editorComponent.onToolbarH5();
        testingComponent.editorComponent.onToolbarH6();
        testingComponent.editorComponent.onToolbarHr();
        testingComponent.editorComponent.onToolbarBold();
        testingComponent.editorComponent.onToolbarClear();
        testingComponent.editorComponent.onToolbarCode();
        testingComponent.editorComponent.onToolbarCodeBlock();
        testingComponent.editorComponent.onToolbarDateTime();
        testingComponent.editorComponent.onToolbarItalic();
        testingComponent.editorComponent.onToolbarLowerCase();
        testingComponent.editorComponent.onToolbarOrderedList();
        testingComponent.editorComponent.onToolbarPageBreak();
        testingComponent.editorComponent.onToolbarQuote();
        testingComponent.editorComponent.onToolbarRedo();
        testingComponent.editorComponent.onToolbarStrikethrough();
        testingComponent.editorComponent.onToolbarTex();
        testingComponent.editorComponent.onToolbarUnorderedList();
        testingComponent.editorComponent.onToolbarUndo();
        testingComponent.editorComponent.onToolbarUpperCase();
        testingComponent.editorComponent.onToolbarPicture();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        testingComponent.editorComponent.setDisabledState!(false);
        testingComponent.editorComponent.onChange();
        testingComponent.editorComponent.onTouched();

        // Value getter
        const ctent = testingComponent.editorComponent.value;
        // Value setter
        testingComponent.editorComponent.value = ctent;
      }

      discardPeriodicTasks();
      flush();
    }));

    // According to NZ-ANTD repo, there is no way to wait for editor initialized
    // .../components/code-editor/code-editor.spec.ts
    xit('edit mode with value change', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      tick();
      fixture.detectChanges();

      expect(testingComponent).toBeTruthy();
      expect(testingComponent.editorComponent).toBeTruthy();

      // const intervalCount = interval(1000);
      // const takeFive = intervalCount.pipe(takeLast(5));
      // takeFive.subscribe(x => {
      //   console.log(x);
      // });

      let curval = testingComponent.editorComponent?.value;
      tick();
      flush();
      fixture.detectChanges();

      testingComponent.editorComponent?.onToolbarH1();
      testingComponent.formGrp.get('infoControl')?.markAsDirty();
      testingComponent.formGrp.get('infoControl')?.updateValueAndValidity();

      tick();
      flush();
      fixture.detectChanges();

      curval = testingComponent.formGrp.get('infoControl')?.value;
      expect(curval).toBeTruthy();
    }));
  });
});
