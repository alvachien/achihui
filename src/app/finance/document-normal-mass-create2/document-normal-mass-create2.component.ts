import { Component, OnInit, ViewChild } from '@angular/core';
import { MatHorizontalStepper } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { UIDisplayStringUtil } from 'app/model';

class MassCreateMode {
  public id: number;
  public displayTerm: string;
}

@Component({
  selector: 'hih-document-normal-mass-create2',
  templateUrl: './document-normal-mass-create2.component.html',
  styleUrls: ['./document-normal-mass-create2.component.scss'],
})
export class DocumentNormalMassCreate2Component implements OnInit {
  // Stepper
  @ViewChild(MatHorizontalStepper, {static: true}) _stepper: MatHorizontalStepper;
  // Step: Generic info
  public firstFormGroup: FormGroup;
  // Step: Items
  public secondFormGroup: FormGroup;
  // Step: Confirm
  public confirmInfo: any = {};

  chosedMode: number;
  availableModes: MassCreateMode[] = [ {
    id: 1,
    displayTerm: 'Mode 1: Repeatly create normal documents',
  }, {
    id: 2,
    displayTerm: 'Mode 2: Freely create Mass Normal Documents',
  }];
  public arFrequencies: any[] = UIDisplayStringUtil.getRepeatFrequencyDisplayStrings();

  constructor() {
    this.chosedMode = 1;

    this.firstFormGroup = new FormGroup({
      modeControl: new FormControl(1, Validators.required),
    });
    this.secondFormGroup = new FormGroup({
      startDateControl: new FormControl(''),
      endDateControl: new FormControl(''),
      frqControl: new FormControl(''),
    });
  }

  ngOnInit(): void {
    // Do nothing
  }
}
