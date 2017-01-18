import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter, Input,Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers, Response, RequestOptions, URLSearchParams }
  from '@angular/http';
import * as HIHCommon from '../../../model/common';
import * as HIHLearn from '../../../model/learnmodel';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { UIStatusService } from '../../../services/uistatus.service';

@Component({
  selector: 'learn-object-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit, AfterViewInit, OnDestroy {

  private routerID: number = -1; // Current category ID in routing
  public currentMode: string;
  public detailObject: HIHLearn.LearnObject = null;
  public uiMode: HIHCommon.UIMode = HIHCommon.UIMode.Create;
  @Input() elementId: String;
  @Output() onEditorKeyup = new EventEmitter<any>();

  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
    private uistatus: UIStatusService) {
      this.detailObject = new HIHLearn.LearnObject();
      this.uiMode = HIHCommon.UIMode.Create;
  }

  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of LearnObjectDetail");
    }
    
    // Distinguish current mode
    this.activateRoute.url.subscribe(x => {
      if (x instanceof Array && x.length > 0) {
        if (x[0].path === "create") {
          this.currentMode = "Create";
          this.detailObject = new HIHLearn.LearnObject();
          this.uiMode = HIHCommon.UIMode.Create;
        } else if (x[0].path === "edit") {
          this.currentMode = "Edit"
          this.uiMode = HIHCommon.UIMode.Change;
        } else if(x[0].path === "display") {
          this.currentMode = "Display";
          this.uiMode = HIHCommon.UIMode.Display;
        }

        // Update the sub module
        this.uistatus.setLearnSubModule(this.currentMode + " Object");
      }
    }, error => {

    }, () => {

    });

    // let aid: number = -1;
    // this.activateRoute.params.forEach((next: { id: number }) => {
    //     aid = next.id;
    // });

    // if (aid !== -1 && aid != this.routerID) {
    //     this.routerID = aid;        
    // } else if (aid === -1) {
    //   // Create mode
    // }
  }

  private editor: any = null;

  ngAfterViewInit() {
    tinymce.init({
      selector: '#' + this.elementId,
      plugins: ['link', 'paste', 'table'],
      skin_url: 'assets/tinymceskins/lightgray',
      setup: editor => {
        this.editor = editor;
        editor.on('keyup', () => {
          const content = editor.getContent();
          this.onEditorKeyup.emit(content);
        });
      },
    });
  }

  ngOnDestroy() {
    tinymce.remove(this.editor);
  }  
}
