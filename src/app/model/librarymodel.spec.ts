//
// Unit test for librarymodel.ts
//

import { Location, BookCategory, MovieGenre, PersonRole, OrganizationType, 
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
    expect(genobj.ID).toEqual(objtbt.ID);
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
    expect(genobj.ID).toEqual(objtbt.ID);
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

describe('MovieGenre', () => {
  let mvgen: MovieGenre;

  beforeEach(() => {
    mvgen = new MovieGenre();
  });

  it('init', () => {
    expect(mvgen).toBeTruthy();

    expect(mvgen.ID).toBeFalsy();
    expect(mvgen.HID).toBeFalsy();
    expect(mvgen.Name).toBeFalsy();
    expect(mvgen.Others).toBeFalsy();
  });
  it('writeJSONobject and onSetdata', () => {
    mvgen.Name = 'test1';
    mvgen.Others = 'others';
    const jdata = mvgen.writeJSONObject();
    expect(jdata).toBeTruthy();

    const mvgen2: MovieGenre = new MovieGenre();
    mvgen2.onSetData(jdata);
    expect(mvgen2).toBeTruthy();
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
  it('case for onSetData', () => {
    objtbt.ID = 2;
    objtbt.HID = 10;
    objtbt.NativeName = 'test1';
    objtbt.Detail = 'test1';
    let genobj = objtbt.writeJSONObject();

    let objtbt2 = new Person();
    objtbt2.onSetData(genobj);
    expect(objtbt2.ID).toEqual(objtbt.ID);
    expect(objtbt2.HID).toEqual(objtbt.HID);
    expect(objtbt2.NativeName).toEqual(objtbt.NativeName);
    expect(objtbt2.Detail).toEqual(objtbt.Detail);
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
