import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../services';

@Component({
  selector: 'hih-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.less'],
})
export class UserDetailComponent implements OnInit {
  userID: string;
  userName: string;
  userMail: string;
  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.authContent.subscribe({
      next: val => {
        this.userID = val.getUserId();
        this.userName = val.getUserName();
        this.userMail = val.getUserMailbox();
      }
    });
  }
}
