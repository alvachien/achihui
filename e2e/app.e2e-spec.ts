import { AchihuiPage } from './app.po';

describe('achihui App', function() {
  let page: AchihuiPage;

  beforeEach(() => {
    page = new AchihuiPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
