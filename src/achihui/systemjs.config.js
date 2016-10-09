/**
 * System configuration for Angular 2 app
 * Reference: https://github.com/angular/quickstart
 */
(function (global) {
    System.config({
        transpiler: 'typescript',
        //typescript compiler options
        typescriptOptions: {
            emitDecoratorMetadata: true
        },
        paths: {
            // paths serve as alias
            'lib:': 'libs/js/'
        },
        map: {
            'app': 'app/js', // 'dist',

            // angular bundles
            '@angular/core': 'lib:@angular/core/bundles/core.umd.js',
            '@angular/common': 'lib:@angular/common/bundles/common.umd.js',
            '@angular/compiler': 'lib:@angular/compiler/bundles/compiler.umd.js',
            '@angular/platform-browser': 'lib:@angular/platform-browser/bundles/platform-browser.umd.js',
            '@angular/platform-browser-dynamic': 'lib:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
            '@angular/http': 'lib:@angular/http/bundles/http.umd.js',
            '@angular/router': 'lib:@angular/router/bundles/router.umd.js',
            '@angular/forms': 'lib:@angular/forms/bundles/forms.umd.js',

            // angular testing umd bundles
            '@angular/core/testing': 'lib:@angular/core/bundles/core-testing.umd.js',
            '@angular/common/testing': 'lib:@angular/common/bundles/common-testing.umd.js',
            '@angular/compiler/testing': 'lib:@angular/compiler/bundles/compiler-testing.umd.js',
            '@angular/platform-browser/testing': 'lib:@angular/platform-browser/bundles/platform-browser-testing.umd.js',
            '@angular/platform-browser-dynamic/testing': 'lib:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic-testing.umd.js',
            '@angular/http/testing': 'lib:@angular/http/bundles/http-testing.umd.js',
            '@angular/router/testing': 'lib:@angular/router/bundles/router-testing.umd.js',
            '@angular/forms/testing': 'lib:@angular/forms/bundles/forms-testing.umd.js',

            // other libraries
            'rxjs': 'lib:rxjs',
            'angular2-in-memory-web-api': 'lib:angular2-in-memory-web-api',
            'moment': 'lib:moment/min/moment.min.js',
            'ng2-bootstrap': 'lib:ng2-bootstrap',
            'ng2-translate': 'lib:ng2-translate',
            'oidc-client': 'lib:oidc-client/dist/oidc-client.min.js',
            'typescript': 'lib:typescript/lib/typescript.js'
        },
        packages: {
            'app': {
                main: './main.js',
                format: 'register',
                defaultExtension: 'js'
            },
            'rxjs': {
                defaultExtension: 'js'
            },
            'ng2-bootstrap': {
                defaultExtension: 'js'
            },
            'ng2-translate': {
                defaultExtension: 'js'
            },
            'angular2-in-memory-web-api': {
                defaultExtension: 'js'
            }
        }
    });
})(this);
