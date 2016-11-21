import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {
    Http, Headers, Response,
    RequestOptions, URLSearchParams
} from '@angular/http';
import '../rxjs-operators';
import * as HIHEvent from '../model/event';
import {
    APIUrl, DebugLogging
} from '../app.setting';
import { AuthService } from '../services/auth.service';
import { BufferService } from '../services/buffer.service';

@Injectable()
export class EventService {
    private apiURL: string;

    constructor(private http: Http,
        private authService: AuthService,
        private buffService: BufferService) {
        if (DebugLogging) {
            console.log("Entering constructor of FinanceService");
        }

        this.apiURL = APIUrl + "event";
    }

    loadEvents() {
        if (DebugLogging) {
            console.log("Entering loadSettings of FinanceService");
        }

        var headers = new Headers();
        headers.append('Accept', 'application/json');
        if (this.authService.authSubject.getValue().isAuthorized)
            headers.append('Authorization', 'Bearer ' + this.authService.authSubject.getValue().getAccessToken());

        return this.http.get(this.apiURL, { headers: headers })
            .map(response => response.json());
    }
}
