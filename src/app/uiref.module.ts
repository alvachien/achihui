import { NgModule } from '@angular/core';
import { HttpModule, Http } from '@angular/http';
import { TinyMceDirective } from './directives/tinymce.directive';

@NgModule({
    imports: [
    ],
    declarations: [
        TinyMceDirective
    ],
    exports: [
        TinyMceDirective
    ]
})
export class UIRefModule { }
