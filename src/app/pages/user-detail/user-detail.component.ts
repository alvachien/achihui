import { Component, OnInit } from '@angular/core';

import { UIDisplayStringUtil } from '../../model';
import { AuthService, HomeDefOdataService } from '../../services';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'hih-user-detail',
    templateUrl: './user-detail.component.html',
    styleUrls: ['./user-detail.component.less'],
    imports: [
      FormsModule,
      ReactiveFormsModule,
      NzPageHeaderModule,
      NzButtonModule,
      NzCheckboxModule,
      NzDescriptionsModule,
      NzSwitchModule,
      TranslocoModule,
    ]
})
export class UserDetailComponent implements OnInit {
  userID: string | null = null;
  userName: string | null = null;
  userMail: string | null = null;

  currentHomeName: string | null = null;
  currentHomeMemDisplayAs: string | null = null;
  currentHomeMemIsChild: boolean | null = null;
  currentHomeMemRelI18n: string | null = null;

  constructor(private authService: AuthService, private homeService: HomeDefOdataService) {}

  ngOnInit() {
    this.authService.authContent.subscribe({
      next: (val) => {
        this.userID = val.getUserId() ?? '';
        this.userName = val.getUserName() ?? '';
        this.userMail = val.getUserMailbox() ?? '';
      },
    });

    if (this.homeService && this.homeService.ChosedHome) {
      this.currentHomeName = this.homeService.ChosedHome.Name;
      this.currentHomeMemDisplayAs = this.homeService.CurrentMemberInChosedHome?.DisplayAs ?? '';
      this.currentHomeMemIsChild = this.homeService.CurrentMemberInChosedHome?.IsChild ?? false;

      const arrels = UIDisplayStringUtil.getHomeMemberRelationEnumStrings();
      arrels.forEach((val) => {
        if (val.value === this.homeService.CurrentMemberInChosedHome?.Relation) {
          this.currentHomeMemRelI18n = val.i18nterm;
        }
      });
    }
  }
  onLogout(): void {
    this.authService.doLogout();
    // Clear all buffers
  }
}
