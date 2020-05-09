import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgZorroAntdModule, } from 'ng-zorro-antd';

import { getTranslocoModule } from '../../../testing';
import { environment } from '../../../environments/environment';
import { AboutComponent } from './about.component';
import { UIStatusService } from '../../services';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgZorroAntdModule,
        getTranslocoModule(),
      ],
      declarations: [
        AboutComponent,
      ],
      providers: [
        UIStatusService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    const uisrv = TestBed.inject(UIStatusService);
    uisrv.versionResult = {
      APIVersion: '1.8',
      StorageVersion: '16',
    };
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('check current version', () => {
    const compiled: any = fixture.debugElement.nativeElement;
    const p: any = compiled.querySelector('#curversion');
    expect(p.textContent.trim()).toEqual(environment.CurrentVersion.trim());
  });
});
