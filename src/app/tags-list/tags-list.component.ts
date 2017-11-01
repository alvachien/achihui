import { Component, OnInit } from '@angular/core';
import { CloudData, CloudOptions } from 'angular-tag-cloud-module';
import { environment } from '../../environments/environment';
import { LogLevel, Tag, TagCount, TagTypeEnum } from '../model';
import { AuthService } from '../services/auth.service';
import { HomeDefDetailService } from '../services/home-def-detail.service';
import { TagsService } from '../services/tags.service';
import { UIStatusService } from '../services/uistatus.service';

@Component({
  selector: 'app-tags-list',
  templateUrl: './tags-list.component.html',
  styleUrls: ['./tags-list.component.scss']
})
export class TagsListComponent implements OnInit {
  optionsCloud: CloudOptions = {
    // if width is between 0 and 1 it will be set to the size of the upper element multiplied by the value  
    width : 0.8,
    height : 400,
    overflow: false,
  }
  dataCloud: Array<CloudData> = [];
  tagTerm: string;
  tagType: TagTypeEnum;
  rstSearch: TagCount[] = [];

  constructor(private _tagService: TagsService,
    public _uiService: UIStatusService) {
  }

  ngOnInit() {
    this._tagService.fetchAllTags().subscribe(x => {
      this.dataCloud = [];
      for(let s1 of x) {
        let cd: CloudData = {
          text: s1.Term,
          weight: s1.TermCount
        };
        this.dataCloud.push(cd);
      }
    });
  }

  public tagClicked(clicked: CloudData){
    console.log(clicked);
  }

  public onSearchTagTerm() {
    this._tagService.fetchAllTags(this.tagType, this.tagTerm).subscribe(x => {
      this.rstSearch = [];

      for(let s1 of x) {
        this.rstSearch.push(s1);
      }
    });
  }
}
