import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom, isDevMode, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import routeConfig from './app.routes';
import { icons } from './icons-provider';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';
import { LogLevel, provideAuth } from 'angular-auth-oidc-client';
import { environment } from '@environments/environment';
import { ThemeService } from '@services/theme.service';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routeConfig), 
    provideNzIcons(icons), 
    provideNzI18n(en_US), 
    importProvidersFrom(FormsModule), 
    provideAnimationsAsync(), 
    provideHttpClient(), 
    provideHttpClient(),
    provideTransloco({
      config: { 
        availableLangs: ['en'],
        defaultLang: 'en',
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader
    }),
    provideAppInitializer(() => {
      const themeService = inject(ThemeService);
      themeService.loadTheme();
    }),
    provideAuth({
      config: {
        authority: environment.IDServerUrl,

        redirectUrl: environment.AppHost, // window.location.origin,
        postLogoutRedirectUri: environment.AppHost,

        clientId: 'achihui.js',
        scope: 'openid profile api.hih offline_access', // 'openid profile ' + your scopes
        responseType: 'code',

        silentRenew: true,
        useRefreshToken: true,
        // silentRenewUrl: window.location.origin + '/silent-renew.html',
        // renewTimeBeforeTokenExpiresInSeconds: 666,
        // tokenRefreshInSeconds: 600,

        // disableIdTokenValidation: true,
        // ignoreNonceAfterRefresh: true, // this is required if the id_token is not returned
        // // allowUnsafeReuseRefreshToken: true, // this is required if the refresh token is not rotated
        // triggerRefreshWhenIdTokenExpired: false, // required to refresh the browser if id_token is not updated after the first authentication
        logLevel: LogLevel.Warn,      
      }
    }),
  ]
};
