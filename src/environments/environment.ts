// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  LoginRequired: true,
  CurrentVersion: '1.0.75',
  ReleasedDate: '2020.9.1',
  DefaultLanguage: 'en',

  DebugLogging: true,
  LoggingLevel: 4,
  IDServerUrl: 'http://localhost:41016',
  AppLoginCallbackUrl: 'http://localhost:29521/logincallback.html',
  AppLogoutCallbackUrl: 'http://localhost:29521',
  AppLoginSlientRevewCallbackUrl: 'http://localhost:29521/silentrenewcallback.html',
  AppHost: 'http://localhost:29521',
  ApiUrl: 'http://localhost:25688',

  AppMathExercise: 'http://localhost:20000',
  AppGallery: 'http://localhost:16001',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
