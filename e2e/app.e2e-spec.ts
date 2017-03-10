import { D3chartsPage } from './app.po';

describe('d3charts App', () => {
  let page: D3chartsPage;

  beforeEach(() => {
    page = new D3chartsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
