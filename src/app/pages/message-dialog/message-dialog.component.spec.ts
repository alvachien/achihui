import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { MessageDialogComponent } from './message-dialog.component';
import { getTranslocoModule } from '../../../testing';

describe('MessageDialogComponent', () => {
  let component: MessageDialogComponent;
  let fixture: ComponentFixture<MessageDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NzModalModule,
        getTranslocoModule(),
      ],
      declarations: [
        MessageDialogComponent,
      ],
      providers: [
        { provide: NzModalRef, useValue: {} }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageDialogComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
