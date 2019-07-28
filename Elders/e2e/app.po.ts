import { browser, element, by } from 'protractor';

export class AchihuiPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('hih-app h1')).getText();
  }
}
