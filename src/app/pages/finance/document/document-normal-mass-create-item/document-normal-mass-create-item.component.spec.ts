import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { FinanceUIModule } from '../../finance-ui.module';
import { getTranslocoModule } from '../../../../../testing';
import { DocumentNormalMassCreateItemComponent } from './document-normal-mass-create-item.component';

describe('DocumentNormalMassCreateItemComponent', () => {
  let component: DocumentNormalMassCreateItemComponent;
  let fixture: ComponentFixture<DocumentNormalMassCreateItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        FinanceUIModule,
        NoopAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        getTranslocoModule(),
      ],
      declarations: [DocumentNormalMassCreateItemComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentNormalMassCreateItemComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('event createItemClicked shall work', () => {
  //   spyOn(component.createItemClicked, 'emit');

  //   component.fireCreateItemEvent();
  //   expect(component.createItemClicked.emit).toHaveBeenCalledWith();
  // });

  // it('event copyItemClicked shall work', () => {
  //   spyOn(component.copyItemClicked, 'emit');

  //   component.fireCopyItemEvent();
  //   expect(component.copyItemClicked.emit).toHaveBeenCalledWith();
  // });

  // it('event removeItemClicked shall work', () => {
  //   spyOn(component.removeItemClicked, 'emit');

  //   component.fireRemoveItemEvent();
  //   expect(component.removeItemClicked.emit).toHaveBeenCalledWith();
  // });
});
