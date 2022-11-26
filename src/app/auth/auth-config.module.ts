import { NgModule } from '@angular/core';
import { AuthModule, LogLevel } from 'angular-auth-oidc-client';
import { environment } from 'src/environments/environment';

// "authCallback id token expired" after upgrade to 14.1.5
// https://github.com/damienbod/angular-auth-oidc-client/issues/1546
@NgModule({
    imports: [AuthModule.forRoot({
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
            logLevel: environment.LoggingLevel === 2 ? LogLevel.Error : LogLevel.Warn,
          }
      })],
    exports: [AuthModule],
})
export class AuthConfigModule {}
