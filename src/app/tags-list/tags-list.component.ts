import { Component, OnInit, ViewChild, AfterContentInit, ElementRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, pipe, ReplaySubject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { EChartOption } from 'echarts';
import { MatSnackBar } from '@angular/material';

import { environment } from '../../environments/environment';
import { LogLevel, Tag, TagCount, TagTypeEnum } from '../model';
import { AuthService, TagsService, HomeDefDetailService, UIStatusService } from '../services';
import { ThemeStorage } from '../theme-picker/theme-storage/theme-storage';

@Component({
  selector: 'hih-tags-list',
  templateUrl: './tags-list.component.html',
  styleUrls: ['./tags-list.component.scss'],
})
export class TagsListComponent implements OnInit, AfterContentInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  tagTerm: string;
  tagType: TagTypeEnum;
  rstSearch: Tag[] = [];
  // @ViewChild('tagcloud') tagcloud: ElementRef;
  tagChartOption: Observable<EChartOption>;
  chartTheme: string;

  constructor(private _tagService: TagsService,
    private _router: Router,
    private _themeStorage: ThemeStorage,
    private _snackbar: MatSnackBar,
    public _uiService: UIStatusService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering TagsListComponent constructor...');
    }

    this.tagType = TagTypeEnum.LearnQuestionBank;
    let curtheme: any = this._themeStorage.getStoredTheme();
    if (curtheme) {
      if (curtheme.isDark) {
        this.chartTheme = 'dark';
      } else {
        this.chartTheme = 'light';
      }
    } else {
      this.chartTheme = 'light';
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering TagsListComponent ngOnInit...');
    }

    this._destroyed$ = new ReplaySubject(1);
    this._themeStorage.onThemeUpdate.pipe(takeUntil(this._destroyed$)).subscribe((val: any) => {
      if (val.isDark) {
        this.chartTheme = 'dark';
      } else {
        this.chartTheme = 'light';
      }
    });
  }

  ngAfterContentInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering TagsListComponent ngAfterContentInit...');
    }

    this._tagService.fetchAllTags(true).pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log('AC_HIH_UI [Debug]: Entering TagsListComponent ngAfterContentInit, fetchAllTags...');
      }

      if (!x) {
        return;
      }

      let dataCloud: any[] = [];
      for (let s1 of x) {
        let s2: TagCount = <TagCount>s1;

        let cd: any = {
          name: s2.Term,
          value: s2.TermCount,
        };
        dataCloud.push(cd);
      }

      this.tagChartOption = of([]).pipe(
        map(() => {
          return {
            tooltip: {},
            series: [{
              type: 'wordCloud',
              gridSize: 2,
              sizeRange: [12, 50],
              rotationRange: [-90, 90],
              shape: 'pentagon',
              width: 600,
              height: 400,
              drawOutOfBound: true,
              textStyle: {
                normal: {
                  color: () => {
                    return 'rgb(' + [
                      Math.round(Math.random() * 160),
                      Math.round(Math.random() * 160),
                      Math.round(Math.random() * 160),
                    ].join(',') + ')';
                  },
                },
                emphasis: {
                  shadowBlur: 10,
                  shadowColor: '#333',
                },
              },
              data: dataCloud,
            }],
          };
        }),
      );
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC_HIH_UI [Error]: Entering TagsListComponent ngAfterContentInit, fetchAllTags, failed ${error}`);
      }

      this._snackbar.open(error, undefined, {
        duration: 2000,
      });
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering TagsListComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }

  // public tagClicked(clicked: CloudData): void {
  //   console.log(clicked);
  // }

  public onSearchTagTerm(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering TagsListComponent onSearchTagTerm...');
    }

    this._tagService.fetchAllTags(false, this.tagType, this.tagTerm)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((x: any) => {
      this.rstSearch = [];

      for (let s1 of x) {
        this.rstSearch.push(<Tag>s1);
      }
    });
  }

  public showDetailInfo(rst: Tag): void {
    this._router.navigate([rst.LinkTarget]);
  }
}
