import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CloudData, CloudOptions } from 'angular-tag-cloud-module';
import { environment } from '../../environments/environment';
import { LogLevel, Tag, TagCount, TagTypeEnum } from '../model';
import { AuthService } from '../services/auth.service';
import { HomeDefDetailService } from '../services/home-def-detail.service';
import { TagsService } from '../services/tags.service';
import { UIStatusService } from '../services/uistatus.service';

@Component({
  selector: 'hih-tags-list',
  templateUrl: './tags-list.component.html',
  styleUrls: ['./tags-list.component.scss'],
})
export class TagsListComponent implements OnInit {
  optionsCloud: CloudOptions = {
    // if width is between 0 and 1 it will be set to the size of the upper element multiplied by the value
    width: 0.8,
    height: 400,
    overflow: false,
  };
  dataCloud: CloudData[] = [];
  tagTerm: string;
  tagType: TagTypeEnum;
  rstSearch: Tag[] = [];

  constructor(private _tagService: TagsService,
    private _router: Router,
    public _uiService: UIStatusService) {
    this.tagType = TagTypeEnum.LearnQuestionBank;
  }

  ngOnInit(): void {
    this._tagService.fetchAllTags(true).subscribe((x: any) => {
      this.dataCloud = [];
      for (let s1 of x) {
        let s2: TagCount = <TagCount>s1;

        let cd: CloudData = {
          text: s2.Term,
          weight: s2.TermCount,
        };
        this.dataCloud.push(cd);
      }
    });
  }

  public tagClicked(clicked: CloudData): void {
    console.log(clicked);
  }

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
