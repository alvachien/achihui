import { async, ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
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
  <form [formGroup]="formGroup">
    <ac-markdown-editor formControlName="infoControl"></ac-markdown-editor>
  </form>
  `
})
export class MarkdownEditorTestFormComponent {
  public formGroup: FormGroup;
  @ViewChild(MarkdownEditorComponent, {static: true}) editorComponent: MarkdownEditorComponent;

  constructor() {
    this.formGroup = new FormGroup({
      infoControl: new FormControl()
    });
  }
}

describe('MarkdownEditorComponent', () => {
  let tesingComponent: MarkdownEditorTestFormComponent;
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
        { provide: AuthService, useValue: authServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkdownEditorTestFormComponent);
    tesingComponent = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(tesingComponent).toBeTruthy();
  });

  describe('edit mode', () => {
    it('edit mode init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(tesingComponent).toBeTruthy();
    }));

    it('edit mode with value change', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      expect(tesingComponent).toBeTruthy();
      expect(tesingComponent.editorComponent).toBeTruthy();
      expect(tesingComponent.editorComponent.editor).toBeTruthy();

      let curval = tesingComponent.editorComponent.value;
      // expect(curval).toBeTruthy();

      tesingComponent.editorComponent.onToolbarH1();
      tesingComponent.formGroup.get('infoControl').markAsDirty();
      tesingComponent.formGroup.get('infoControl').updateValueAndValidity();

      curval = tesingComponent.formGroup.get('infoControl').value;
      expect(curval).toBeTruthy();
    }));
  });
});
