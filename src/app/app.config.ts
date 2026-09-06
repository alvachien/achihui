import {
  ApplicationConfig,
  LOCALE_ID,
  provideZonelessChangeDetection,
  importProvidersFrom,
  isDevMode,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import routeConfig from './app.routes';
import { icons } from './icons-provider';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { en_US, zh_CN, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import zh from '@angular/common/locales/zh';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { authInterceptor } from './services/auth.interceptor';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';
import { LogLevel, provideAuth } from 'angular-auth-oidc-client';
import { environment } from '@environments/environment';
import { ThemeService } from '@services/theme.service';
import { provideNzDateFnsAdapter } from 'ng-zorro-antd/core/time';

registerLocaleData(en);
registerLocaleData(zh, 'zh-cn');

// Default language is driven by environment.DefaultLanguage ('en' | 'zh').
const defaultLang = environment.DefaultLanguage === 'zh' ? 'zh' : 'en';
const isZhDefault = defaultLang === 'zh';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routeConfig),
    provideNzIcons(icons),
    provideNzI18n(isZhDefault ? zh_CN : en_US),
    { provide: LOCALE_ID, useValue: isZhDefault ? 'zh' : 'en-US' },
    importProvidersFrom(FormsModule),
    provideHttpClient(withXhr(), withInterceptors([authInterceptor])),
    provideTransloco({
      config: {
        availableLangs: ['en', 'zh'],
        defaultLang,
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    provideAppInitializer(() => {
      console.log('Entering App Initializer...');
      const themeService = inject(ThemeService);
      return themeService.loadTheme(true);
    }),
    provideAuth({
      config: {
        authority: environment.IDServerUrl,

        redirectUrl: `${environment.AppHost}/signin-callback`, // window.location.origin,
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
      },
    }),
    provideNzDateFnsAdapter(),
  ],
};
