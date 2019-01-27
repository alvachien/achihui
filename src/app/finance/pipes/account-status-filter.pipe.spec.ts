import { AccountStatusFilterPipe } from './account-status-filter.pipe';

describe('AccountStatusFilterPipe', () => {
  it('create an instance', () => {
    const pipe: AccountStatusFilterPipe = new AccountStatusFilterPipe();
    expect(pipe).toBeTruthy();
  });
});
