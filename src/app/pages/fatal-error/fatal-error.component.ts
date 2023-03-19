import { Component, OnInit } from "@angular/core";

import { UIStatusService } from "../../services";

@Component({
  selector: "hih-fatal-error",
  templateUrl: "./fatal-error.component.html",
  styleUrls: ["./fatal-error.component.less"],
})
export class FatalErrorComponent {
  errorContext = "";

  constructor(private uiStatus: UIStatusService) {
    if (this.uiStatus.latestError) {
      this.errorContext = this.uiStatus.latestError;
    }
  }
}
