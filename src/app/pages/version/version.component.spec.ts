import { waitForAsync, ComponentFixture, TestBed } from "@angular/core/testing";
import { NzTimelineModule } from "ng-zorro-antd/timeline";
import { NzBackTopModule } from "ng-zorro-antd/back-top";

import { getTranslocoModule } from "../../../testing";
import { VersionComponent } from "./version.component";

describe("VersionComponent", () => {
  let component: VersionComponent;
  let fixture: ComponentFixture<VersionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NzTimelineModule, NzBackTopModule, getTranslocoModule()],
      declarations: [VersionComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
