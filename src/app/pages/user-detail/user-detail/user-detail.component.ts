import { Component, OnInit } from '@angular/core';

import { AuthService, HomeDefOdataService } from '../../../services';

@Component({
  selector: 'hih-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.less'],
})
export class UserDetailComponent implements OnInit {
  userID: string;
  userName: string;
  userMail: string;

  currentHomeName: string;
  currentHomeMemDisplayAs: string;
  currentHomeMemIsChild: boolean;

  constructor(
    private authService: AuthService,
    private homeService: HomeDefOdataService) { }

  ngOnInit() {
    this.authService.authContent.subscribe({
      next: val => {
        this.userID = val.getUserId();
        this.userName = val.getUserName();
        this.userMail = val.getUserMailbox();
      }
    });

    if (this.homeService && this.homeService.ChosedHome) {
      this.currentHomeName = this.homeService.ChosedHome.Name;
      this.currentHomeMemDisplayAs = this.homeService.CurrentMemberInChosedHome.DisplayAs;
      this.currentHomeMemIsChild = this.homeService.CurrentMemberInChosedHome.IsChild;
    }
  }
}
