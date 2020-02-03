import { UIAccountCtgyFilterExPipe } from './uiaccount-ctgy-filterex.pipe';
import { UIAccountForSelection, financeAccountCategoryCash, financeAccountCategoryCreditCard,
  financeAccountCategoryDeposit, financeAccountCategoryAdvancePayment, financeAccountCategoryAdvanceReceived,
  financeAccountCategoryAsset, financeAccountCategoryBorrowFrom, financeAccountCategoryLendTo } from '../../../model';

describe('UIAccountCtgyFilterExPipe', () => {
  const allAccounts: UIAccountForSelection[] = [];
  let pipe: UIAccountCtgyFilterExPipe;

  beforeAll(() => {
    pipe = new UIAccountCtgyFilterExPipe();

    // Create accounts for testing
    // Cash 1
    let acnt: UIAccountForSelection = new UIAccountForSelection();
    acnt.Id = 1;
    acnt.Name = 'Cash1';
    acnt.CategoryId = financeAccountCategoryCash;
    acnt.AssetFlag = true;
    allAccounts.push(acnt);
    // Creditcard
    acnt = new UIAccountForSelection();
    acnt.Id = 2;
    acnt.Name = 'Creditcard1';
    acnt.CategoryId = financeAccountCategoryCreditCard;
    acnt.AssetFlag = false;
    allAccounts.push(acnt);
    // Deposit
    acnt = new UIAccountForSelection();
    acnt.Id = 3;
    acnt.Name = 'Deposit1';
    acnt.CategoryId = financeAccountCategoryDeposit;
    acnt.AssetFlag = true;
    allAccounts.push(acnt);
    // ADP
    acnt = new UIAccountForSelection();
    acnt.Id = 4;
    acnt.Name = 'ADPay1';
    acnt.CategoryId = financeAccountCategoryAdvancePayment;
    acnt.AssetFlag = true;
    allAccounts.push(acnt);
    // ADR
    acnt = new UIAccountForSelection();
    acnt.Id = 5;
    acnt.Name = 'ADRev1';
    acnt.CategoryId = financeAccountCategoryAdvanceReceived;
    acnt.AssetFlag = false;
    allAccounts.push(acnt);
    // Asset
    acnt = new UIAccountForSelection();
    acnt.Id = 6;
    acnt.Name = 'Asset1';
    acnt.CategoryId = financeAccountCategoryAsset;
    acnt.AssetFlag = true;
    allAccounts.push(acnt);
    // Borrow from
    acnt = new UIAccountForSelection();
    acnt.Id = 7;
    acnt.Name = 'Borrow from';
    acnt.CategoryId = financeAccountCategoryBorrowFrom;
    acnt.AssetFlag = false;
    allAccounts.push(acnt);
    // Lend to
    acnt = new UIAccountForSelection();
    acnt.Id = 8;
    acnt.Name = 'Lend to';
    acnt.CategoryId = financeAccountCategoryLendTo;
    acnt.AssetFlag = true;
    allAccounts.push(acnt);
    // // Virutal
    // acnt = new UIAccountForSelection();
    // acnt.Id = 9;
    // acnt.Name = 'Virtual';
    // acnt.CategoryId = financeAccount;
    // acnt.AssetFlag = true;
    // allAccounts.push(acnt);
  });

  it('1. create an instance', () => {
    expect(pipe).toBeTruthy();
  });
  it('2. include cash account, exclude nothing', () => {
    const rstAccounts: UIAccountForSelection[] = pipe.transform(allAccounts, {
      includedCategories: [
        financeAccountCategoryCash,
      ],
      excludedCategories: [
      ],
    });
    expect(rstAccounts.length).toBeGreaterThan(0);
    // expect(rstAccounts[0].Name).toContain('Cash');
  });
  it('3. include nothing, exclude cash account', () => {
    const rstAccounts: UIAccountForSelection[] = pipe.transform(allAccounts, {
      includedCategories: [
      ],
      excludedCategories: [
        financeAccountCategoryCash,
      ],
    });
    expect(rstAccounts.length).toBeGreaterThan(1);
    rstAccounts.forEach((val: UIAccountForSelection) => {
      expect(val.Name).not.toContain('Cash');
    });
  });
  it('4. exclude adp, adr, asset, borrow and lend', () => {
    const rstAccounts: UIAccountForSelection[] = pipe.transform(allAccounts, {
      includedCategories: [
        financeAccountCategoryCash,
      ],
      excludedCategories: [
        financeAccountCategoryAdvancePayment,
        financeAccountCategoryAdvanceReceived,
        financeAccountCategoryAsset,
        financeAccountCategoryBorrowFrom,
        financeAccountCategoryLendTo,
      ],
    });
    expect(rstAccounts.length).toBeGreaterThan(0);
  });
});
