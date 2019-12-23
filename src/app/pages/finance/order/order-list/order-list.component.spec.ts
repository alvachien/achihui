import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { OrderListComponent } from './order-list.component';
import { getTranslocoModule } from '../../../../../testing';

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        OrderListComponent,
        getTranslocoModule(),
      ],
      imports: [
        NzSpinModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
