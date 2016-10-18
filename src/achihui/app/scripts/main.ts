import { AppComponent } from './app.component';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
import { environment } from './app.setting';

if (environment !== 'Development') {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
