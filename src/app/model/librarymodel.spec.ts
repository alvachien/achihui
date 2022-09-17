//
// Unit test for librarymodel.ts
//

import { Location, BookCategory, PersonRole, OrganizationType, 
  LocationTypeEnum, Book, Person, Organization} from './librarymodel';

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
    let genobj = objtbt.writeJSONObject();
    expect(genobj.Id).toEqual(objtbt.ID);
    expect(genobj.Name).toEqual(objtbt.Name);
    expect(genobj.HomeID).toBeUndefined();
    expect(genobj.Comment).toBeUndefined();
  });
  it('case for verify', () => {
    objtbt.ID = 1;
    let vrst = objtbt.onVerify();
    expect(vrst).toBeFalse();
    objtbt.Name = 'test2';
    vrst = objtbt.onVerify();
    expect(vrst).toBeTrue();
    objtbt.Name = '1234567890123456789012345678901';
    vrst = objtbt.onVerify();
    expect(vrst).toBeFalse();
  });
  it('case for onSetData', () => {
    objtbt.ID = 2;
    objtbt.HomeID = 10;
    objtbt.Name = 'test1';
    objtbt.Comment = 'test1';
    let genobj = objtbt.writeJSONObject();

    let objtbt2 = new PersonRole();
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
    let genobj = objtbt.writeJSONObject();
    expect(genobj.Id).toEqual(objtbt.ID);
    expect(genobj.Name).toEqual(objtbt.Name);
    expect(genobj.HomeID).toBeUndefined();
    expect(genobj.Comment).toBeUndefined();
  });
  it('case for verify', () => {
    objtbt.ID = 1;
    let vrst = objtbt.onVerify();
    expect(vrst).toBeFalse();
    objtbt.Name = 'test2';
    vrst = objtbt.onVerify();
    expect(vrst).toBeTrue();
    objtbt.Name = '1234567890123456789012345678901';
    vrst = objtbt.onVerify();
    expect(vrst).toBeFalse();
  });
  it('case for onSetData', () => {
    objtbt.ID = 2;
    objtbt.HomeID = 10;
    objtbt.Name = 'test1';
    objtbt.Comment = 'test1';
    let genobj = objtbt.writeJSONObject();

    let objtbt2 = new OrganizationType();
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
    let genobj = bkctgy.writeJSONObject();
    expect(genobj.Id).toEqual(bkctgy.ID);
    expect(genobj.Name).toEqual(bkctgy.Name);
    expect(genobj.HomeID).toBeUndefined();
    expect(genobj.Comment).toBeUndefined();
  });
  it('case for verify', () => {
    bkctgy.ID = 1;
    let vrst = bkctgy.onVerify();
    expect(vrst).toBeFalse();
    bkctgy.Name = 'test2';
    vrst = bkctgy.onVerify();
    expect(vrst).toBeTrue();
    bkctgy.Name = '1234567890123456789012345678901';
    vrst = bkctgy.onVerify();
    expect(vrst).toBeFalse();
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
    let genobj = objtbt.writeJSONObject();
    expect(genobj.Id).toEqual(objtbt.ID);
    expect(genobj.NativeName).toEqual(objtbt.NativeName);
  });
  it('case for verify', () => {
    objtbt.ID = 1;
    let vrst = objtbt.onVerify();
    expect(vrst).toBeFalse();
    objtbt.NativeName = 'test2';
    vrst = objtbt.onVerify();
    expect(vrst).toBeTrue();
  });
  it('case for verify with roles', () => {
    objtbt.ID = 1;
    objtbt.NativeName = 'test2';
    objtbt.Roles.push(new PersonRole());
    let vrst = objtbt.onVerify();
    expect(vrst).toBeFalse();

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
    expect(vrst).toBeFalse();

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
    expect(vrst).toBeTrue();
  });
  it('case for onSetData without roles', () => {
    let genobj = {
      "Id": 22,
      "HomeID": 2,
      "NativeName": "User 2",
      "ChineseName": null,
      "NativeIsChinese": true,
      "Detail": "Details",
      "CreatedAt": null,
      "Createdby": null,
      "UpdatedAt": null,
      "Updatedby": null,
      "Roles": []
    };

    objtbt.onSetData(genobj);
    expect(objtbt.ID).toEqual(objtbt.ID);
    expect(objtbt.HID).toEqual(objtbt.HID);
    expect(objtbt.NativeName).toEqual(objtbt.NativeName);
    expect(objtbt.Detail).toEqual('Details');
    expect(objtbt.Roles.length).toEqual(0);
  });
  it('case for onSetData with roles', () => {
    let genobj = {
      "Id": 22,
      "HomeID": 2,
      "NativeName": "User 2",
      "ChineseName": null,
      "NativeIsChinese": true,
      "Detail": null,
      "CreatedAt": null,
      "Createdby": null,
      "UpdatedAt": null,
      "Updatedby": null,
      "Roles": [
        {
          "Id": 11,
          "HomeID": null,
          "Name": "Author",
          "Comment": "Author of book",
          "CreatedAt": null,
          "Createdby": null,
          "UpdatedAt": null,
          "Updatedby": null
        }
      ]
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
    let genobj = objtbt.writeJSONObject();
    expect(genobj.Id).toEqual(objtbt.ID);
    expect(genobj.NativeName).toEqual(objtbt.NativeName);
    expect(genobj.NativeIsChinese).toBeTrue();
  });
  it('case for writeJSONObject with role', () => {
    objtbt.ID = 1;
    objtbt.HID = 2;
    objtbt.NativeName = 'test';
    objtbt.ChineseIsNative = true;
    objtbt.Roles = [];
    let role: PersonRole = new PersonRole();
    role.ID = 2;
    role.Name = 'test2';
    objtbt.Roles.push(role);
    let genobj = objtbt.writeJSONObject();
    expect(genobj.Id).toEqual(objtbt.ID);
    expect(genobj.NativeName).toEqual(objtbt.NativeName);
    expect(genobj.NativeIsChinese).toBeTrue();
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
    let genobj = objtbt.writeJSONObject();
    expect(genobj.Id).toEqual(objtbt.ID);
    expect(genobj.NativeName).toEqual(objtbt.NativeName);
  });
  it('case for verify', () => {
    objtbt.ID = 1;
    let vrst = objtbt.onVerify();
    expect(vrst).toBeFalse();
    objtbt.NativeName = 'test2';
    vrst = objtbt.onVerify();
    expect(vrst).toBeTrue();
  });
  it('case for verify with types', () => {
    objtbt.ID = 1;
    objtbt.NativeName = 'test2';
    objtbt.Types.push(new OrganizationType());
    let vrst = objtbt.onVerify();
    expect(vrst).toBeFalse();

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
    expect(vrst).toBeFalse();

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
    expect(vrst).toBeTrue();
  });
  it('case for onSetData without types', () => {
    let genobj = {
      "Id": 22,
      "HomeID": 2,
      "NativeName": "User 2",
      "ChineseName": null,
      "NativeIsChinese": true,
      "Detail": "Details",
      "CreatedAt": null,
      "Createdby": null,
      "UpdatedAt": null,
      "Updatedby": null,
      "Types": []
    };

    objtbt.onSetData(genobj);
    expect(objtbt.ID).toEqual(objtbt.ID);
    expect(objtbt.HID).toEqual(objtbt.HID);
    expect(objtbt.NativeName).toEqual(objtbt.NativeName);
    expect(objtbt.Detail).toEqual('Details');
    expect(objtbt.Types.length).toEqual(0);
  });
  it('case for onSetData with types', () => {
    let genobj = {
      "Id": 22,
      "HomeID": 2,
      "NativeName": "User 2",
      "ChineseName": null,
      "NativeIsChinese": true,
      "Detail": null,
      "CreatedAt": null,
      "Createdby": null,
      "UpdatedAt": null,
      "Updatedby": null,
      "Types": [
        {
          "Id": 11,
          "HomeID": null,
          "Name": "Author",
          "Comment": "Author of book",
          "CreatedAt": null,
          "Createdby": null,
          "UpdatedAt": null,
          "Updatedby": null
        }
      ]
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
    objtbt.Types = [];
    let genobj = objtbt.writeJSONObject();
    expect(genobj.Id).toEqual(objtbt.ID);
    expect(genobj.NativeName).toEqual(objtbt.NativeName);
    expect(genobj.NativeIsChinese).toBeTrue();
  });
  it('case for writeJSONObject with role', () => {
    objtbt.ID = 1;
    objtbt.HID = 2;
    objtbt.NativeName = 'test';
    objtbt.ChineseIsNative = true;
    objtbt.Types = [];
    let role: OrganizationType = new OrganizationType();
    role.ID = 2;
    role.Name = 'test2';
    objtbt.Types.push(role);
    let genobj = objtbt.writeJSONObject();
    expect(genobj.Id).toEqual(objtbt.ID);
    expect(genobj.NativeName).toEqual(objtbt.NativeName);
    expect(genobj.NativeIsChinese).toBeTrue();
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

  it('writeJSONObject', () => {
    objtbt.HID = 2;
    objtbt.NativeName = 'Test Book 1';
    objtbt.ChineseIsNative = true;
    objtbt.PageCount = 500;
    let ctgy = new BookCategory();
    ctgy.ID = 2;
    objtbt.Categories.push(ctgy);
    let loc = new Location();
    loc.ID = 1;
    objtbt.Locations.push(loc);
    let auth = new Person();
    auth.ID = 1;
    objtbt.Authors.push(auth);
    let tran = new Person();
    tran.ID = 2;
    objtbt.Translators.push(tran);
    let prs = new Organization();
    prs.ID = 1;
    objtbt.Presses.push(prs);

    let objdata = objtbt.writeJSONObject();
    expect(objdata.HomeID).toEqual(2);
    expect(objdata.NativeName).toEqual('Test Book 1');
    expect(objdata.NativeIsChinese).toBeTrue();
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

  it('onSetData', () => {
    let objdata = {
      "Id": 2,
      "HomeID": 2,
      "NativeName": "Test Book 1",
      "ChineseName": null,
      "NativeIsChinese": true,
      "ISBN": null,
      "PublishedYear": null,
      "Detail": null,
      "OriginLangID": null,
      "BookLangID": null,
      "PageCount": 500,
      "CreatedAt": "2022-09-10T00:00:00+08:00",
      "Createdby": null,
      "UpdatedAt": "2022-09-10T00:00:00+08:00",
      "Updatedby": null,
      "Categories": [
          {
              "Id": 2,
              "HomeID": 2,
              "Name": "现代小说",
              "Comment": null,
              "ParentID": null,
              "CreatedAt": "2022-09-10T00:00:00+08:00",
              "Createdby": null,
              "UpdatedAt": "2022-09-10T00:00:00+08:00",
              "Updatedby": null
          }
      ],
      "Locations": [
          {
              "Id": 1,
              "HomeID": 2,
              "Name": "书房",
              "LocationType": 0,
              "Comment": null,
              "CreatedAt": "2022-09-10T00:00:00+08:00",
              "Createdby": null,
              "UpdatedAt": "2022-09-10T00:00:00+08:00",
              "Updatedby": null
          }
      ],
      "Authors": [
          {
              "Id": 1,
              "HomeID": 2,
              "NativeName": "User 1",
              "ChineseName": null,
              "NativeIsChinese": true,
              "Detail": null,
              "CreatedAt": null,
              "Createdby": null,
              "UpdatedAt": null,
              "Updatedby": null
          }
      ],
      "Translators": [
        {
            "Id": 2,
            "HomeID": 2,
            "NativeName": "User 2",
            "ChineseName": null,
            "NativeIsChinese": true,
            "Detail": null,
            "CreatedAt": null,
            "Createdby": null,
            "UpdatedAt": null,
            "Updatedby": null
        }
      ],
      "Presses": [
          {
              "Id": 1,
              "HomeID": 2,
              "NativeName": "人民文学出版社",
              "ChineseName": null,
              "NativeIsChinese": true,
              "Detail": null,
              "CreatedAt": "2022-09-10T00:00:00+08:00",
              "Createdby": null,
              "UpdatedAt": "2022-09-10T00:00:00+08:00",
              "Updatedby": null
          }
      ]
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
