// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,

  DebugLogging: true,
  LoggingLevel: 4,
  IDServerUrl: 'http://localhost:41016/',
  AppLoginCallbackUrl: 'http://localhost:29521/logincallback.html',
  AppLogoutCallbackUrl: 'http://localhost:29521/',
  AppHost: 'http://localhost:29521/',
  ApiUrl: 'http://localhost:25688/'
};
