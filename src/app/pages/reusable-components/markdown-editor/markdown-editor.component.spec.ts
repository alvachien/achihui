import { async, ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { NgZorroAntdModule, NzConfigService, } from 'ng-zorro-antd';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { NzCodeEditorModule } from 'ng-zorro-antd/code-editor';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MarkdownModule } from 'ngx-markdown';
import { BehaviorSubject } from 'rxjs';
import { KatexOptions } from 'ngx-markdown';

import { getTranslocoModule } from '../../../../testing';
import { MarkdownEditorComponent } from './markdown-editor.component';
import { AuthService } from '../../../services';
import { UserAuthInfo } from '../../../../app/model';

@Component({
  template: `
    <form [formGroup]="formGrp">
      <nz-form-item>
        <nz-form-control>
          <ac-markdown-editor formControlName="infoControl"></ac-markdown-editor>
        </nz-form-control>
      </nz-form-item>
    </form>`,
})
export class MarkdownEditorTestFormComponent {
  public formGrp: FormGroup;
  @ViewChild(MarkdownEditorComponent, {static: true}) editorComponent: MarkdownEditorComponent;

  constructor() {
    this.formGrp = new FormGroup({
      infoControl: new FormControl()
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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgZorroAntdModule,
        getTranslocoModule(),
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        NzResizableModule,
        NzCodeEditorModule,
        MarkdownModule.forRoot(),
      ],
      declarations: [
        MarkdownEditorComponent,
        MarkdownEditorTestFormComponent,
      ],
      providers: [
        NzConfigService,
        { provide: AuthService, useValue: authServiceStub },
      ]
    })
    .compileComponents();
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
      tick(3000);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(testingComponent).toBeTruthy();
      expect(testingComponent.editorComponent).toBeTruthy();

      tick();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testingComponent.editorComponent.editor).toBeTruthy();

      let curval = testingComponent.editorComponent.value;
      tick();
      flush();
      fixture.detectChanges();

      testingComponent.editorComponent.onToolbarH1();
      testingComponent.formGrp.get('infoControl').markAsDirty();
      testingComponent.formGrp.get('infoControl').updateValueAndValidity();

      tick();
      flush();
      fixture.detectChanges();

      curval = testingComponent.formGrp.get('infoControl').value;
      expect(curval).toBeTruthy();
    }));
  });
});
