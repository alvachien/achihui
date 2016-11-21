import { NgModule } from '@angular/core';
import { HttpModule, Http } from '@angular/http';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from "ng2-translate/ng2-translate";
import { TinyMceDirective2 } from './directives/tinymce.directive';

@NgModule({
    imports: [
        TranslateModule.forRoot({
            provide: TranslateLoader,
            useFactory: (http: Http) => new TranslateStaticLoader(http, '/app/locales/', '.json'),
            deps: [Http]
        }),
    ],
    declarations: [
        TinyMceDirective2
    ],
    exports: [
        TinyMceDirective2,
        TranslateModule
        //AlbumDetailResolve
    ]
})
export class UIRefModule { }
