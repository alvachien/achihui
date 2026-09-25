//
// Unit test for librarymodel.ts
//

import { addMonths } from 'date-fns';
import {
  Location,
  BookCategory,
  PersonRole,
  OrganizationType,
  LocationTypeEnum,
  Book,
  Person,
  Organization,
  BookBorrowRecord,
  BookReadingRecord,
  BookReadingStatus,
} from './librarymodel';

describe('PersonRole', () => {
  let objtbt: PersonRole;

  beforeEach(() => {
    objtbt = new PersonRole();
  });

  it('init', () => {
    expect(objtbt).toBeTruthy();
    objtbt.Name = 'test';
    expect(objtbt.Name.length).toBeGreaterThan(0);
    objtbt.onInit();
    expect(objtbt.Name.length).toEqual(0);
  });

  it('case without homeid and comment', () => {
    objtbt.ID = 1;
    objtbt.Name = 'test1';
    const genobj = objtbt.writeJSONObject();
    expect(genobj.Id).toEqual(objtbt.ID);
    expect(genobj.Name).toEqual(objtbt.Name);
    expect(genobj.HomeID).toBeUndefined();
    expect(genobj.Comment).toBeUndefined();
  });
  it('case for verify', () => {
    objtbt.ID = 1;
    let vrst = objtbt.onVerify();
    expect(vrst).toBe(false);
    objtbt.Name = 'test2';
    vrst = objtbt.onVerify();
    expect(vrst).toBe(true);
    objtbt.Name = '1234567890123456789012345678901';
    vrst = objtbt.onVerify();
    expect(vrst).toBe(false);
  });
  it('case for onSetData', () => {
    objtbt.ID = 2;
    objtbt.HomeID = 10;
    objtbt.Name = 'test1';
    objtbt.Comment = 'test1';
    const genobj = objtbt.writeJSONObject();

    const objtbt2 = new PersonRole();
    objtbt2.onSetData(genobj);
    expect(objtbt2.ID).toEqual(objtbt.ID);
    expect(objtbt2.HomeID).toEqual(objtbt.HomeID);
    expect(objtbt2.Name).toEqual(objtbt.Name);
    expect(objtbt2.Comment).toEqual(objtbt.Comment);
  });
});

describe('OrganizationType', () => {
  let objtbt: OrganizationType;

  beforeEach(() => {
    objtbt = new OrganizationType();
  });

  it('init', () => {
    expect(objtbt).toBeTruthy();
    objtbt.Name = 'test';
    objtbt.Comment = 'test';
    expect(objtbt.Name.length).toBeGreaterThan(0);
    expect(objtbt.Comment.length).toBeGreaterThan(0);

    objtbt.onInit();
    expect(objtbt.Name.length).toEqual(0);
    expect(objtbt.Comment.length).toEqual(0);
  });

  it('case without homeid and comment', () => {
    objtbt.ID = 1;
    objtbt.Name = 'test1';
    const genobj = objtbt.writeJSONObject();
    expect(genobj.Id).toEqual(objtbt.ID);
    expect(genobj.Name).toEqual(objtbt.Name);
    expect(genobj.HomeID).toBeUndefined();
    expect(genobj.Comment).toBeUndefined();
  });
  it('case for verify', () => {
    objtbt.ID = 1;
    let vrst = objtbt.onVerify();
    expect(vrst).toBe(false);
    objtbt.Name = 'test2';
    vrst = objtbt.onVerify();
    expect(vrst).toBe(true);
    objtbt.Name = '1234567890123456789012345678901';
    vrst = objtbt.onVerify();
    expect(vrst).toBe(false);
  });
  it('case for onSetData', () => {
    objtbt.ID = 2;
    objtbt.HomeID = 10;
    objtbt.Name = 'test1';
    objtbt.Comment = 'test1';
    const genobj = objtbt.writeJSONObject();

    const objtbt2 = new OrganizationType();
    objtbt2.onSetData(genobj);
    expect(objtbt2.ID).toEqual(objtbt.ID);
    expect(objtbt2.HomeID).toEqual(objtbt.HomeID);
    expect(objtbt2.Name).toEqual(objtbt.Name);
    expect(objtbt2.Comment).toEqual(objtbt.Comment);
  });
});

describe('Location', () => {
  let objloc: Location;

  beforeEach(() => {
    objloc = new Location();
  });

  it('onInit', () => {
    expect(objloc).toBeTruthy();

    objloc.Name = 'test1';
    objloc.LocType = LocationTypeEnum.EBook;
    objloc.Comment = 'desp';
    expect(objloc.Name).toBeTruthy();
    objloc.onInit();
    expect(objloc.Name.length).toEqual(0);
    //expect(objloc.LocType).toEqual(LocationTypeEnum.PaperBook);
  });

  it('onVerify', () => {
    let vrst = objloc.onVerify();
    expect(vrst).toBe(false);

    objloc.HID = 2;
    objloc.Name = 'test';
    vrst = objloc.onVerify();
    expect(vrst).toBe(true);
  });

  it('writeJSONobject and onSetdata', () => {
    objloc.Name = 'test1';
    objloc.LocType = LocationTypeEnum.EBook;
    objloc.Comment = 'desp';
    const jdata = objloc.writeJSONObject();
    expect(jdata).toBeTruthy();

    const objloc2: Location = new Location();
    objloc2.onSetData(jdata);
    expect(objloc2).toBeTruthy();
  });
});

describe('BookCategory', () => {
  let bkctgy: BookCategory;

  beforeEach(() => {
    bkctgy = new BookCategory();
  });

  it('init', () => {
    expect(bkctgy).toBeTruthy();

    expect(bkctgy.ID).toBeFalsy();
    expect(bkctgy.HID).toBeFalsy();
    expect(bkctgy.Name).toBeFalsy();
    expect(bkctgy.Comment).toBeFalsy();
  });
  it('case without homeid and comment', () => {
    bkctgy.ID = 1;
    bkctgy.Name = 'test1';
    const genobj = bkctgy.writeJSONObject();
    expect(genobj.Id).toEqual(bkctgy.ID);
    expect(genobj.Name).toEqual(bkctgy.Name);
    expect(genobj.HomeID).toBeUndefined();
    expect(genobj.Comment).toBeUndefined();
  });
  it('case for verify', () => {
    bkctgy.ID = 1;
    let vrst = bkctgy.onVerify();
    expect(vrst).toBe(false);
    bkctgy.Name = 'test2';
    vrst = bkctgy.onVerify();
    expect(vrst).toBe(true);
    bkctgy.Name = '1234567890123456789012345678901';
    vrst = bkctgy.onVerify();
    expect(vrst).toBe(false);
  });

  it('writeJSONobject and onSetdata', () => {
    bkctgy.Name = 'test1';
    bkctgy.Comment = 'others';
    const jdata = bkctgy.writeJSONObject();
    expect(jdata).toBeTruthy();

    const bkctgy2: BookCategory = new BookCategory();
    bkctgy2.onSetData(jdata);
    expect(bkctgy2).toBeTruthy();
    expect(bkctgy2.Name).toEqual(bkctgy.Name);
    expect(bkctgy2.Comment).toEqual(bkctgy.Comment);
  });
});

describe('Person', () => {
  let objtbt: Person;

  beforeEach(() => {
    objtbt = new Person();
  });

  it('init', () => {
    expect(objtbt).toBeTruthy();
    objtbt.NativeName = 'test';
    expect(objtbt.NativeName.length).toBeGreaterThan(0);
    objtbt.onInit();
    expect(objtbt.NativeName.length).toEqual(0);
  });

  it('case without homeid and comment', () => {
    objtbt.ID = 1;
    objtbt.NativeName = 'test1';
    const genobj = objtbt.writeJSONObject();
    expect(genobj.Id).toEqual(objtbt.ID);
    expect(genobj.NativeName).toEqual(objtbt.NativeName);
  });
  it('case for verify', () => {
    objtbt.ID = 1;
    let vrst = objtbt.onVerify();
    expect(vrst).toBe(false);
    objtbt.NativeName = 'test2';
    vrst = objtbt.onVerify();
    expect(vrst).toBe(true);
  });
  it('case for verify with roles', () => {
    objtbt.ID = 1;
    objtbt.NativeName = 'test2';
    objtbt.Roles.push(new PersonRole());
    let vrst = objtbt.onVerify();
    expect(vrst).toBe(false);

    objtbt.Roles = [];
    let ot: PersonRole = new PersonRole();
    ot.ID = 1;
    objtbt.Roles.push(ot);
    ot = new PersonRole();
    ot.ID = 2;
    objtbt.Roles.push(ot);
    ot = new PersonRole();
    ot.ID = 2;
    objtbt.Roles.push(ot);
    vrst = objtbt.onVerify();
    expect(vrst).toBe(false);

    objtbt.Roles = [];
    ot = new PersonRole();
    ot.ID = 1;
    objtbt.Roles.push(ot);
    ot = new PersonRole();
    ot.ID = 2;
    objtbt.Roles.push(ot);
    ot = new PersonRole();
    ot.ID = 3;
    objtbt.Roles.push(ot);
    vrst = objtbt.onVerify();
    expect(vrst).toBe(true);
  });
  it('case for onSetData without roles', () => {
    const genobj = {
      Id: 22,
      HomeID: 2,
      NativeName: 'User 2',
      ChineseName: null,
      NativeIsChinese: true,
      Detail: 'Details',
      CreatedAt: null,
      Createdby: null,
      UpdatedAt: null,
      Updatedby: null,
      Roles: [],
    };

    objtbt.onSetData(genobj);
    expect(objtbt.ID).toEqual(objtbt.ID);
    expect(objtbt.HID).toEqual(objtbt.HID);
    expect(objtbt.NativeName).toEqual(objtbt.NativeName);
    expect(objtbt.Detail).toEqual('Details');
    expect(objtbt.Roles.length).toEqual(0);
  });
  it('case for onSetData with roles', () => {
    const genobj = {
      Id: 22,
      HomeID: 2,
      NativeName: 'User 2',
      ChineseName: null,
      NativeIsChinese: true,
      Detail: null,
      CreatedAt: null,
      Createdby: null,
      UpdatedAt: null,
      Updatedby: null,
      Roles: [
        {
          Id: 11,
          HomeID: null,
          Name: 'Author',
          Comment: 'Author of book',
          CreatedAt: null,
          Createdby: null,
          UpdatedAt: null,
          Updatedby: null,
        },
      ],
    };

    objtbt.onSetData(genobj);
    expect(objtbt.ID).toEqual(22);
    expect(objtbt.HID).toEqual(2);
    expect(objtbt.NativeName).toEqual('User 2');
    expect(objtbt.Roles.length).toEqual(1);
    expect(objtbt.Roles[0].ID).toEqual(11);
    expect(objtbt.Roles[0].Name).toEqual('Author');
  });
  it('case for writeJSONObject without role', () => {
    objtbt.ID = 1;
    objtbt.HID = 2;
    objtbt.NativeName = 'test';
    objtbt.ChineseIsNative = true;
    objtbt.Roles = [];
    const genobj = objtbt.writeJSONObject();
    expect(genobj.Id).toEqual(objtbt.ID);
    expect(genobj.NativeName).toEqual(objtbt.NativeName);
    expect(genobj.NativeIsChinese).toBe(true);
  });
  it('case for writeJSONObject with role', () => {
    objtbt.ID = 1;
    objtbt.HID = 2;
    objtbt.NativeName = 'test';
    objtbt.ChineseIsNative = true;
    objtbt.Roles = [];
    const role: PersonRole = new PersonRole();
    role.ID = 2;
    role.Name = 'test2';
    objtbt.Roles.push(role);
    const genobj = objtbt.writeJSONObject();
    expect(genobj.Id).toEqual(objtbt.ID);
    expect(genobj.NativeName).toEqual(objtbt.NativeName);
    expect(genobj.NativeIsChinese).toBe(true);
    expect(genobj.PersonRoles.length).toEqual(1);
    expect(genobj.PersonRoles[0].RoleId).toEqual(2);
  });
});

describe('Organization', () => {
  let objtbt: Organization;

  beforeEach(() => {
    objtbt = new Organization();
  });

  it('init', () => {
    expect(objtbt).toBeTruthy();
    objtbt.NativeName = 'test';
    expect(objtbt.NativeName.length).toBeGreaterThan(0);
    objtbt.onInit();
    expect(objtbt.NativeName.length).toEqual(0);
  });

  it('case without homeid and comment', () => {
    objtbt.ID = 1;
    objtbt.NativeName = 'test1';
    const genobj = objtbt.writeJSONObject();
    expect(genobj.Id).toEqual(objtbt.ID);
    expect(genobj.NativeName).toEqual(objtbt.NativeName);
  });
  it('case for verify', () => {
    objtbt.ID = 1;
    let vrst = objtbt.onVerify();
    expect(vrst).toBe(false);
    objtbt.NativeName = 'test2';
    vrst = objtbt.onVerify();
    expect(vrst).toBe(true);
  });
  it('case for verify with types', () => {
    objtbt.ID = 1;
    objtbt.NativeName = 'test2';
    objtbt.Types.push(new OrganizationType());
    let vrst = objtbt.onVerify();
    expect(vrst).toBe(false);

    objtbt.Types = [];
    let ot: OrganizationType = new OrganizationType();
    ot.ID = 1;
    objtbt.Types.push(ot);
    ot = new OrganizationType();
    ot.ID = 2;
    objtbt.Types.push(ot);
    ot = new OrganizationType();
    ot.ID = 2;
    objtbt.Types.push(ot);
    vrst = objtbt.onVerify();
    expect(vrst).toBe(false);

    objtbt.Types = [];
    ot = new OrganizationType();
    ot.ID = 1;
    objtbt.Types.push(ot);
    ot = new OrganizationType();
    ot.ID = 2;
    objtbt.Types.push(ot);
    ot = new OrganizationType();
    ot.ID = 3;
    objtbt.Types.push(ot);
    vrst = objtbt.onVerify();
    expect(vrst).toBe(true);
  });
  it('case for onSetData without types', () => {
    const genobj = {
      Id: 22,
      HomeID: 2,
      NativeName: 'User 2',
      ChineseName: null,
      NativeIsChinese: true,
      Detail: 'Details',
      CreatedAt: null,
      Createdby: null,
      UpdatedAt: null,
      Updatedby: null,
      Types: [],
    };

    objtbt.onSetData(genobj);
    expect(objtbt.ID).toEqual(objtbt.ID);
    expect(objtbt.HID).toEqual(objtbt.HID);
    expect(objtbt.NativeName).toEqual(objtbt.NativeName);
    expect(objtbt.Detail).toEqual('Details');
    expect(objtbt.Types.length).toEqual(0);
  });
  it('case for onSetData with types', () => {
    const genobj = {
      Id: 22,
      HomeID: 2,
      NativeName: 'User 2',
      ChineseName: null,
      NativeIsChinese: true,
      Detail: null,
      CreatedAt: null,
      Createdby: null,
      UpdatedAt: null,
      Updatedby: null,
      Types: [
        {
          Id: 11,
          HomeID: null,
          Name: 'Author',
          Comment: 'Author of book',
          CreatedAt: null,
          Createdby: null,
          UpdatedAt: null,
          Updatedby: null,
        },
      ],
    };

    objtbt.onSetData(genobj);
    expect(objtbt.ID).toEqual(22);
    expect(objtbt.HID).toEqual(2);
    expect(objtbt.NativeName).toEqual('User 2');
    expect(objtbt.Types.length).toEqual(1);
    expect(objtbt.Types[0].ID).toEqual(11);
    expect(objtbt.Types[0].Name).toEqual('Author');
  });
  it('case for writeJSONObject without type', () => {
    objtbt.ID = 1;
    objtbt.HID = 2;
    objtbt.NativeName = 'test';
    objtbt.ChineseIsNative = true;
    objtbt.Detail = 'test';
    objtbt.Types = [];

    const genobj = objtbt.writeJSONObject();
    expect(genobj.Id).toEqual(objtbt.ID);
    expect(genobj.NativeName).toEqual(objtbt.NativeName);
    expect(genobj.NativeIsChinese).toBe(true);
  });
  it('case for writeJSONObject with role', () => {
    objtbt.ID = 1;
    objtbt.HID = 2;
    objtbt.NativeName = 'test';
    objtbt.ChineseIsNative = true;
    objtbt.Types = [];
    const role: OrganizationType = new OrganizationType();
    role.ID = 2;
    role.Name = 'test2';
    objtbt.Types.push(role);
    const genobj = objtbt.writeJSONObject();
    expect(genobj.Id).toEqual(objtbt.ID);
    expect(genobj.NativeName).toEqual(objtbt.NativeName);
    expect(genobj.NativeIsChinese).toBe(true);
    expect(genobj.OrganizationTypes.length).toEqual(1);
    expect(genobj.OrganizationTypes[0].TypeId).toEqual(2);
  });
});

describe('Book', () => {
  let objtbt: Book;

  beforeEach(() => {
    objtbt = new Book();
  });

  it('onInit', () => {
    objtbt.onInit();
    expect(objtbt.ID).toEqual(0);
    expect(objtbt.HID).toBeNull();
  });

  it('onVerify', () => {
    let vrst = objtbt.onVerify();
    expect(vrst).toBe(false);

    objtbt.NativeName = 'test';
    objtbt.HID = 2;
    vrst = objtbt.onVerify();
    expect(vrst).toBe(true);
  });

  it('writeJSONObject', () => {
    objtbt.HID = 2;
    objtbt.NativeName = 'Test Book 1';
    objtbt.ChineseIsNative = true;
    objtbt.PageCount = 500;
    const ctgy = new BookCategory();
    ctgy.ID = 2;
    objtbt.Categories.push(ctgy);
    const loc = new Location();
    loc.ID = 1;
    objtbt.Locations.push(loc);
    const auth = new Person();
    auth.ID = 1;
    objtbt.Authors.push(auth);
    const tran = new Person();
    tran.ID = 2;
    objtbt.Translators.push(tran);
    const prs = new Organization();
    prs.ID = 1;
    objtbt.Presses.push(prs);

    const objdata = objtbt.writeJSONObject();
    expect(objdata.HomeID).toEqual(2);
    expect(objdata.NativeName).toEqual('Test Book 1');
    expect(objdata.NativeIsChinese).toBe(true);
    expect(objdata.PageCount).toEqual(500);
    expect(objdata.BookCategories).toBeInstanceOf(Array);
    expect(objdata.BookCategories.length).toEqual(1);
    expect(objdata.BookCategories[0].CategoryId).toEqual(2);
    expect(objdata.BookLocations).toBeInstanceOf(Array);
    expect(objdata.BookLocations.length).toEqual(1);
    expect(objdata.BookLocations[0].LocationId).toEqual(1);
    expect(objdata.BookAuthors).toBeInstanceOf(Array);
    expect(objdata.BookAuthors.length).toEqual(1);
    expect(objdata.BookAuthors[0].AuthorId).toEqual(1);
    expect(objdata.BookTranslators).toBeInstanceOf(Array);
    expect(objdata.BookTranslators.length).toEqual(1);
    expect(objdata.BookTranslators[0].TranslatorId).toEqual(2);
    expect(objdata.BookPresses).toBeInstanceOf(Array);
    expect(objdata.BookPresses.length).toEqual(1);
    expect(objdata.BookPresses[0].PressId).toEqual(1);
  });

  // CopyCount 0 means "the book is gone but kept for its reading history", so it
  // is the one numeric field on Book whose 0 must survive both directions: the
  // `> 0` guard its siblings use in writeJSONObject and the truthiness check they
  // use in onSetData would each drop it, silently turning a retired book back
  // into an unrecorded (i.e. still owned) one.
  it('carries CopyCount 0 through writeJSONObject and onSetData', () => {
    objtbt.HID = 2;
    objtbt.NativeName = 'Retired Book';
    objtbt.CopyCount = 0;

    const objdata = objtbt.writeJSONObject();
    expect(objdata.CopyCount).toEqual(0);

    const read = new Book();
    read.onSetData({ Id: 3, HomeID: 2, NativeName: 'Retired Book', CopyCount: 0 });
    expect(read.CopyCount).toEqual(0);
  });

  it('omits CopyCount when it was never set', () => {
    objtbt.HID = 2;
    objtbt.NativeName = 'Book with no count';

    // The counterpart of the test above: "unset" is omission, not a 0, so a book
    // whose count was never recorded cannot be mistaken for a retired one.
    expect(objtbt.CopyCount).toBeNull();
    expect(objtbt.writeJSONObject().CopyCount).toBeUndefined();
  });

  it('onSetData', () => {
    const objdata = {
      Id: 2,
      HomeID: 2,
      NativeName: 'Test Book 1',
      ChineseName: null,
      NativeIsChinese: true,
      ISBN: null,
      PublishedYear: null,
      Detail: null,
      OriginLangID: null,
      BookLangID: null,
      PageCount: 500,
      CreatedAt: '2022-09-10T00:00:00+08:00',
      Createdby: null,
      UpdatedAt: '2022-09-10T00:00:00+08:00',
      Updatedby: null,
      Categories: [
        {
          Id: 2,
          HomeID: 2,
          Name: '现代小说',
          Comment: null,
          ParentID: null,
          CreatedAt: '2022-09-10T00:00:00+08:00',
          Createdby: null,
          UpdatedAt: '2022-09-10T00:00:00+08:00',
          Updatedby: null,
        },
      ],
      Locations: [
        {
          Id: 1,
          HomeID: 2,
          Name: '书房',
          LocationType: 0,
          Comment: null,
          CreatedAt: '2022-09-10T00:00:00+08:00',
          Createdby: null,
          UpdatedAt: '2022-09-10T00:00:00+08:00',
          Updatedby: null,
        },
      ],
      Authors: [
        {
          Id: 1,
          HomeID: 2,
          NativeName: 'User 1',
          ChineseName: null,
          NativeIsChinese: true,
          Detail: null,
          CreatedAt: null,
          Createdby: null,
          UpdatedAt: null,
          Updatedby: null,
        },
      ],
      Translators: [
        {
          Id: 2,
          HomeID: 2,
          NativeName: 'User 2',
          ChineseName: null,
          NativeIsChinese: true,
          Detail: null,
          CreatedAt: null,
          Createdby: null,
          UpdatedAt: null,
          Updatedby: null,
        },
      ],
      Presses: [
        {
          Id: 1,
          HomeID: 2,
          NativeName: '人民文学出版社',
          ChineseName: null,
          NativeIsChinese: true,
          Detail: null,
          CreatedAt: '2022-09-10T00:00:00+08:00',
          Createdby: null,
          UpdatedAt: '2022-09-10T00:00:00+08:00',
          Updatedby: null,
        },
      ],
    };

    objtbt.onSetData(objdata);
    // Check data
    expect(objtbt).toBeTruthy();
    expect(objtbt.Authors.length).toEqual(1);
    expect(objtbt.Translators.length).toEqual(1);
    expect(objtbt.Presses.length).toEqual(1);
    expect(objtbt.Categories.length).toEqual(1);
  });
});

describe('BookBorrowRecord', () => {
  let objtbt: BookBorrowRecord;

  beforeEach(() => {
    objtbt = new BookBorrowRecord();
  });

  it('onInit', () => {
    objtbt.ID = 1;
    objtbt.HID = 2;
    objtbt.User = 'test';
    objtbt.BorrowFrom = 1;
    objtbt.FromDate = new Date();
    objtbt.ToDate = addMonths(new Date(), 1);
    objtbt.onInit();
    expect(objtbt.ID).toEqual(0);
    expect(objtbt.HID).toBeFalsy();
    expect(objtbt.User).toEqual('');
    expect(objtbt.BorrowFrom).toBeFalsy();
    expect(objtbt.FromDate).toBeFalsy();
    expect(objtbt.ToDate).toBeFalsy();
  });
  it('onVerify', () => {
    objtbt.ID = 1;
    let vrst = objtbt.onVerify();
    expect(vrst).toBe(false);
    expect(objtbt.VerifiedMsgs.length).toBeGreaterThan(0);

    objtbt.HID = 2;
    vrst = objtbt.onVerify();
    expect(vrst).toBe(false);
    expect(objtbt.VerifiedMsgs.length).toBeGreaterThan(0);

    objtbt.BookID = 21;
    vrst = objtbt.onVerify();
    expect(vrst).toBe(false);
    expect(objtbt.VerifiedMsgs.length).toBeGreaterThan(0);

    objtbt.User = 'Test';
    vrst = objtbt.onVerify();
    expect(vrst).toBe(true);
    expect(objtbt.VerifiedMsgs.length).toEqual(0);

    objtbt.FromDate = new Date();
    objtbt.ToDate = addMonths(new Date(), -2);
    vrst = objtbt.onVerify();
    expect(vrst).toBe(false);
    expect(objtbt.VerifiedMsgs.length).toBeGreaterThan(0);

    objtbt.ToDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // add 1 day
    vrst = objtbt.onVerify();
    expect(vrst).toBe(true);
    expect(objtbt.VerifiedMsgs.length).toEqual(0);
  });

  it('writeObject and onSetData', () => {
    objtbt.ID = 1;
    objtbt.HID = 2;
    objtbt.User = 'test';
    objtbt.BorrowFrom = 1;
    objtbt.FromDate = new Date();
    objtbt.ToDate = addMonths(new Date(), 1);
    objtbt.Comment = 'test';
    objtbt.HasReturned = true;
    const jsonobj = objtbt.writeJSONObject();
    const objtbt2 = new BookBorrowRecord();
    objtbt2.onSetData(jsonobj);
    expect(objtbt2.ID).toEqual(objtbt.ID);
    expect(objtbt2.HID).toEqual(objtbt.HID);
    expect(objtbt2.User).toEqual(objtbt.User);
    expect(objtbt2.BorrowFrom).toEqual(objtbt.BorrowFrom);
    expect(objtbt2.FromDateString).toEqual(objtbt.FromDateString);
    expect(objtbt2.ToDateString).toEqual(objtbt.ToDateString);
    expect(objtbt2.HasReturned).toBe(true);
    expect(objtbt2.Comment).toEqual(objtbt.Comment);
  });
});

describe('BookReadingRecord', () => {
  let objtbt: BookReadingRecord;

  beforeEach(() => {
    objtbt = new BookReadingRecord();
  });

  it('onInit', () => {
    objtbt.ID = 1;
    objtbt.HID = 2;
    objtbt.BookID = 3;
    objtbt.User = 'test';
    objtbt.FromDate = new Date();
    objtbt.ToDate = addMonths(new Date(), 1);
    objtbt.Status = BookReadingStatus.Reading;
    objtbt.onInit();
    expect(objtbt.ID).toEqual(0);
    expect(objtbt.HID).toBeFalsy();
    expect(objtbt.BookID).toBeFalsy();
    expect(objtbt.User).toEqual('');
    expect(objtbt.FromDate).toBeFalsy();
    expect(objtbt.ToDate).toBeFalsy();
    // Reset to the terminal default: never enable finalize actions on a fresh model.
    expect(objtbt.Status).toEqual(BookReadingStatus.Completed);
    expect(objtbt.IsReading).toBe(false);
  });

  it('onVerify', () => {
    objtbt.ID = 1;
    let vrst = objtbt.onVerify();
    expect(vrst).toBe(false);
    expect(objtbt.VerifiedMsgs.length).toBeGreaterThan(0);

    objtbt.HID = 2;
    vrst = objtbt.onVerify();
    expect(vrst).toBe(false);
    expect(objtbt.VerifiedMsgs.length).toBeGreaterThan(0);

    objtbt.BookID = 21;
    vrst = objtbt.onVerify();
    expect(vrst).toBe(false);
    expect(objtbt.VerifiedMsgs.length).toBeGreaterThan(0);

    objtbt.User = 'Test';
    vrst = objtbt.onVerify();
    // FromDate is mandatory - User alone is not enough.
    expect(vrst).toBe(false);
    expect(objtbt.VerifiedMsgs.length).toBeGreaterThan(0);

    // FromDate alone is valid now: it starts an open (Reading) record that is
    // finalized later via CompleteReading / AbortReading (server derives status).
    objtbt.FromDate = new Date();
    vrst = objtbt.onVerify();
    expect(vrst).toBe(true);
    expect(objtbt.VerifiedMsgs.length).toEqual(0);

    objtbt.ToDate = addMonths(new Date(), -2);
    vrst = objtbt.onVerify();
    expect(vrst).toBe(false);
    expect(objtbt.VerifiedMsgs.length).toBeGreaterThan(0);

    // Same-day reading is valid: ToDate === FromDate must pass.
    objtbt.ToDate = objtbt.FromDate;
    vrst = objtbt.onVerify();
    expect(vrst).toBe(true);
    expect(objtbt.VerifiedMsgs.length).toEqual(0);

    objtbt.ToDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // add 1 day
    vrst = objtbt.onVerify();
    expect(vrst).toBe(true);
    expect(objtbt.VerifiedMsgs.length).toEqual(0);
  });

  it('writeObject and onSetData', () => {
    objtbt.ID = 1;
    objtbt.HID = 2;
    objtbt.BookID = 3;
    objtbt.User = 'test';
    objtbt.FromDate = new Date();
    objtbt.ToDate = addMonths(new Date(), 1);
    objtbt.Comment = 'test';
    const jsonobj = objtbt.writeJSONObject();
    // Wire names the API binder expects (OData property names of the C# entity).
    expect(jsonobj.HomeID).toEqual(2);
    expect(jsonobj.BookId).toEqual(3);
    const objtbt2 = new BookReadingRecord();
    objtbt2.onSetData(jsonobj);
    expect(objtbt2.ID).toEqual(objtbt.ID);
    expect(objtbt2.HID).toEqual(objtbt.HID);
    expect(objtbt2.BookID).toEqual(objtbt.BookID);
    expect(objtbt2.User).toEqual(objtbt.User);
    expect(objtbt2.FromDateString).toEqual(objtbt.FromDateString);
    expect(objtbt2.ToDateString).toEqual(objtbt.ToDateString);
    expect(objtbt2.Comment).toEqual(objtbt.Comment);
  });

  it('writeJSONObject omits Id on a fresh record', () => {
    objtbt.HID = 2;
    objtbt.BookID = 3;
    objtbt.User = 'test';
    const jsonobj = objtbt.writeJSONObject();
    expect(jsonobj.Id).toBeUndefined();
  });

  it('onSetData parses bare Edm.Date strings to local midnight', () => {
    // Regression: a bare 'yyyy-MM-dd' parsed straight by new Date() lands on
    // UTC midnight and can render the previous day - the model must anchor it
    // to local midnight.
    objtbt.onSetData({
      Id: 3,
      HomeID: 1,
      BookId: 2,
      User: 'u',
      FromDate: '2026-09-01',
      ToDate: '2026-09-10',
      Comment: 'c',
    });
    expect(objtbt.ID).toEqual(3);
    expect(objtbt.BookID).toEqual(2);
    expect(objtbt.FromDate!.getTime()).toEqual(new Date(2026, 8, 1).getTime());
    expect(objtbt.ToDate!.getTime()).toEqual(new Date(2026, 8, 10).getTime());
    expect(objtbt.Comment).toEqual('c');
  });

  it('onSetData tolerates full ISO timestamps', () => {
    objtbt.onSetData({
      FromDate: '2026-09-01T00:00:00+08:00',
    });
    expect(objtbt.FromDate).toBeTruthy();
    expect(objtbt.FromDate!.getFullYear()).toEqual(2026);
  });

  it('parses the Status member-name wire format', () => {
    // The API serializes the enum as its member name (integration-test pinned).
    objtbt.onSetData({ Id: 1, Status: 'Reading' });
    expect(objtbt.Status).toEqual(BookReadingStatus.Reading);
    expect(objtbt.IsReading).toBe(true);

    objtbt.onSetData({ Id: 2, Status: 'Completed' });
    expect(objtbt.Status).toEqual(BookReadingStatus.Completed);
    expect(objtbt.IsReading).toBe(false);

    objtbt.onSetData({ Id: 3, Status: 'Aborted' });
    expect(objtbt.Status).toEqual(BookReadingStatus.Aborted);
    expect(objtbt.IsReading).toBe(false);
  });

  it('tolerates the numeric Status form', () => {
    objtbt.onSetData({ Id: 1, Status: 0 });
    expect(objtbt.Status).toEqual(BookReadingStatus.Reading);

    objtbt.onSetData({ Id: 2, Status: 1 });
    expect(objtbt.Status).toEqual(BookReadingStatus.Completed);

    objtbt.onSetData({ Id: 3, Status: 2 });
    expect(objtbt.Status).toEqual(BookReadingStatus.Aborted);
  });

  it('defaults unknown or missing Status to the terminal Completed', () => {
    // A record we cannot classify must never offer the finalize actions.
    objtbt.onSetData({ Id: 1 });
    expect(objtbt.Status).toEqual(BookReadingStatus.Completed);
    expect(objtbt.IsReading).toBe(false);

    objtbt.onSetData({ Id: 2, Status: 'SomethingNew' });
    expect(objtbt.Status).toEqual(BookReadingStatus.Completed);

    objtbt.onSetData({ Id: 3, Status: 7 });
    expect(objtbt.Status).toEqual(BookReadingStatus.Completed);
  });
});
