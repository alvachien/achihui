import { AccountFilterPipe } from "./account-filter.pipe";

xdescribe('TitleCasePipe', () => {
    // This pipe is a pure, stateless function so no need for BeforeEach
    const pipe = new AccountFilterPipe();
  
    xit('transforms "abc" to "Abc"', () => {
      expect(pipe.transform('abc', null)).toBe('Abc');
    });
  
    // it('transforms "abc def" to "Abc Def"', () => {
    //   expect(pipe.transform('abc def', null)).toBe('Abc Def');
    // });
  
    // ... more tests ...
});
