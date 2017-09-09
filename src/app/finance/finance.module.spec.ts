import { FinanceModule } from './finance.module';

describe('FinanceModule', () => {
  let financeModule: FinanceModule;

  beforeEach(() => {
    financeModule = new FinanceModule();
  });

  it('should create an instance', () => {
    expect(financeModule).toBeTruthy();
  });
});
