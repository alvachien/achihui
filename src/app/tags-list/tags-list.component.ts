import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LogLevel, Tag, TagCount, TagTypeEnum } from '../model';
import { AuthService } from '../services/auth.service';
import { HomeDefDetailService } from '../services/home-def-detail.service';
import { TagsService } from '../services/tags.service';
import { UIStatusService } from '../services/uistatus.service';
declare var echarts: any;

@Component({
  selector: 'hih-tags-list',
  templateUrl: './tags-list.component.html',
  styleUrls: ['./tags-list.component.scss'],
})
export class TagsListComponent implements OnInit, AfterViewInit {
  tagTerm: string;
  tagType: TagTypeEnum;
  rstSearch: Tag[] = [];
  @ViewChild('tagcloud') tagcloud: ElementRef;

  constructor(private _tagService: TagsService,
    private _router: Router,
    public _uiService: UIStatusService) {
    this.tagType = TagTypeEnum.LearnQuestionBank;
  }

  ngOnInit(): void {
    // this._tagService.fetchAllTags(true).subscribe((x: any) => {
    //   this.dataCloud = [];
    //   for (let s1 of x) {
    //     let s2: TagCount = <TagCount>s1;

    //     let cd: CloudData = {
    //       text: s2.Term,
    //       weight: s2.TermCount,
    //     };
    //     this.dataCloud.push(cd);
    //   }
    // });
  }

  ngAfterViewInit(): void {
    this._tagService.fetchAllTags(true).subscribe((x: any) => {
      let dataCloud: any[] = [];
      for (let s1 of x) {
        let s2: TagCount = <TagCount>s1;

        let cd: any = {
          name: s2.Term,
          value: s2.TermCount,
        };
        dataCloud.push(cd);
      }

      let chart: any = echarts.init(this.tagcloud.nativeElement);
      let option: any = {
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
      chart.setOption(option);
      });
  }

  // public tagClicked(clicked: CloudData): void {
  //   console.log(clicked);
  // }

  public onSearchTagTerm(): void {
    this._tagService.fetchAllTags(false, this.tagType, this.tagTerm).subscribe((x: any) => {
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
