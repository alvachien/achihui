import { UIAccountStatusFilterPipe } from './uiaccount-status-filter.pipe';
import {
  UIAccountForSelection,
  financeAccountCategoryCash,
  AccountStatusEnum,
  financeAccountCategoryCreditCard,
  financeAccountCategoryDeposit,
} from '../../../model';

describe('UIAccountStatusFilterPipe', () => {
  const allAccounts: UIAccountForSelection[] = [];
  let pipe: UIAccountStatusFilterPipe;

  beforeAll(() => {
    pipe = new UIAccountStatusFilterPipe();

    // Create accounts for testing
    // Cash 1
    let acnt: UIAccountForSelection = new UIAccountForSelection();
    acnt.Id = 1;
    acnt.Name = 'Cash1';
    acnt.CategoryId = financeAccountCategoryCash;
    acnt.AssetFlag = true;
    acnt.Status = AccountStatusEnum.Normal;
    allAccounts.push(acnt);
    // Cash 2
    acnt = new UIAccountForSelection();
    acnt.Id = 11;
    acnt.Name = 'Cash1.1';
    acnt.CategoryId = financeAccountCategoryCash;
    acnt.AssetFlag = true;
    acnt.Status = AccountStatusEnum.Closed;
    allAccounts.push(acnt);
    // Creditcard1
    acnt = new UIAccountForSelection();
    acnt.Id = 2;
    acnt.Name = 'Creditcard1';
    acnt.CategoryId = financeAccountCategoryCreditCard;
    acnt.AssetFlag = false;
    acnt.Status = AccountStatusEnum.Normal;
    allAccounts.push(acnt);
    // Creditcard1
    acnt = new UIAccountForSelection();
    acnt.Id = 21;
    acnt.Name = 'Creditcard2.1';
    acnt.CategoryId = financeAccountCategoryCreditCard;
    acnt.AssetFlag = false;
    acnt.Status = AccountStatusEnum.Frozen;
    allAccounts.push(acnt);
    // Deposit
    acnt = new UIAccountForSelection();
    acnt.Id = 3;
    acnt.Name = 'Deposit1';
    acnt.CategoryId = financeAccountCategoryDeposit;
    acnt.AssetFlag = true;
    acnt.Status = AccountStatusEnum.Normal;
    allAccounts.push(acnt);
    // Deposit3.1
    acnt = new UIAccountForSelection();
    acnt.Id = 31;
    acnt.Name = 'Deposit3.1';
    acnt.CategoryId = financeAccountCategoryDeposit;
    acnt.AssetFlag = true;
    acnt.Status = AccountStatusEnum.Closed;
    allAccounts.push(acnt);
  });
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
  it('2. Normal accounts only', () => {
    const rstAccounts: UIAccountForSelection[] = pipe.transform(allAccounts, 'Normal');
    let acntnum = 0;
    allAccounts.forEach((val: UIAccountForSelection) => {
      if (val.Status === AccountStatusEnum.Normal) {
        ++acntnum;
      }
    });
    expect(rstAccounts.length).toEqual(acntnum);
  });
  it('3. Frozen accounts only', () => {
    const rstAccounts: UIAccountForSelection[] = pipe.transform(allAccounts, 'Frozen');
    let acntnum = 0;
    allAccounts.forEach((val: UIAccountForSelection) => {
      if (val.Status === AccountStatusEnum.Frozen) {
        ++acntnum;
      }
    });
    expect(rstAccounts.length).toEqual(acntnum);
  });
  it('4. Closed accounts only', () => {
    const rstAccounts: UIAccountForSelection[] = pipe.transform(allAccounts, 'Closed');
    let acntnum = 0;
    allAccounts.forEach((val: UIAccountForSelection) => {
      if (val.Status === AccountStatusEnum.Closed) {
        ++acntnum;
      }
    });
    expect(rstAccounts.length).toEqual(acntnum);
  });
});
