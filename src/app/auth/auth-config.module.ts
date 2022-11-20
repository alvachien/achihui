import { NgModule } from '@angular/core';
import { AuthModule } from 'angular-auth-oidc-client';
import { environment } from 'src/environments/environment';


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
            renewTimeBeforeTokenExpiresInSeconds: 600,
          }
      })],
    exports: [AuthModule],
})
export class AuthConfigModule {}
