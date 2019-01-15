import { ThemeStorage, AppUITheme } from './theme-storage';

const testStorageKey: any = ThemeStorage.storageKey;
const testTheme: AppUITheme = {
  primary: '#000000',
  accent: '#ffffff',
  name: 'test-theme',
};

describe('ThemeStorage Service', () => {
  const service: ThemeStorage = new ThemeStorage();
  const getCurrTheme = () => window.localStorage.getItem(testStorageKey);
  const secondTestTheme: AppUITheme = {
    primary: '#666666',
    accent: '#333333',
    name: 'other-test-theme',
  };

  beforeEach(() => {
    // window.localStorage[testStorageKey] = testTheme.name;
    service.storeTheme(testTheme);
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('should set the current theme name', () => {
    expect(getCurrTheme()).toEqual(JSON.stringify(testTheme));
    service.storeTheme(secondTestTheme);
    expect(getCurrTheme()).toEqual(JSON.stringify(secondTestTheme));
  });

  it('should get the current theme name', () => {
    const themeName: any = service.getStoredThemeName();
    expect(themeName).toEqual(testTheme.name);
  });

  it('should clear the stored theme data', () => {
    expect(getCurrTheme()).not.toBeNull();
    service.clearStorage();
    expect(getCurrTheme()).toBeNull();
  });

  it('should emit an event when setTheme is called', () => {
    spyOn(service.onThemeUpdate, 'emit');
    service.storeTheme(secondTestTheme);
    expect(service.onThemeUpdate.emit).toHaveBeenCalled();
    expect(service.onThemeUpdate.emit).toHaveBeenCalledWith(secondTestTheme);
  });
});
