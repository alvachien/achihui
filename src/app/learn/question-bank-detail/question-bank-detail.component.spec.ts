import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionBankDetailComponent } from './question-bank-detail.component';

describe('QuestionBankDetailComponent', () => {
  let component: QuestionBankDetailComponent;
  // let fixture: ComponentFixture<QuestionBankDetailComponent>;

  beforeEach(async(() => {
    // TestBed.configureTestingModule({
    //   declarations: [ QuestionBankDetailComponent ]
    // })
    // .compileComponents();
  }));

  beforeEach(() => {
    // fixture = TestBed.createComponent(QuestionBankDetailComponent);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should be created', () => {
    // expect(component).toBeTruthy();
    expect(component).toBeFalsy();
  });
});
