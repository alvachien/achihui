import { APP_INITIALIZER } from '@angular/core';
import { ThemeService } from './services/theme.service';

export const AppInitializerProvider = {
  provide: APP_INITIALIZER,
  useFactory: (themeService: ThemeService) => () => {
    return themeService.loadTheme();
  },
  deps: [ThemeService],
  multi: true,
};
