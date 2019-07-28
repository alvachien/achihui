import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { LogLevel } from './app/model/common';

/** echarts extensions: */
import 'echarts/theme/macarons.js';
import 'echarts-wordcloud/index.js';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .then((success: any) => {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Bootstrap success');
    }
  })
  .catch((err: any) => {
    if (environment.LoggingLevel >= LogLevel.Error) {
      console.error(`AC_HIH_UI [Error]: Bootstrap failed: ${err}`);
    }
  });
