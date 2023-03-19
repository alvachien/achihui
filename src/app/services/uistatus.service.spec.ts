import { TestBed, inject } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TranslocoService } from "@ngneat/transloco";
import { RouterTestingModule } from "@angular/router/testing";

import { getTranslocoModule } from "../../testing";
import { UIStatusService } from "./uistatus.service";

describe("UIStatusService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        getTranslocoModule(),
      ],
      providers: [UIStatusService, TranslocoService],
    });
  });

  it("should be created", inject(
    [UIStatusService],
    (service: UIStatusService) => {
      expect(service).toBeTruthy();
    }
  ));

  it("properties", inject([UIStatusService], (service: UIStatusService) => {
    expect(service).toBeTruthy();

    service.latestError = "error";
    expect(service.latestError).toBeTruthy();

    service.SelectedLoanTmp = null;
    expect(service.SelectedLoanTmp).toBeNull();

    service.CurrentLanguage = "zh";
    expect(service.CurrentLanguage).toBeTruthy();
  }));
});
