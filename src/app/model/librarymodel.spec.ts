//
// Unit test for librarymodel.ts
//

import { Location, BookCategory, MovieGenre, PersonRole, OrganizationType } from './librarymodel';

describe('PersonRole', () => {
  let objtbt: PersonRole;

  beforeEach(() => {
    objtbt = new PersonRole();
  });

  it('init', () => {
    expect(objtbt).toBeTruthy();
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

  it('init', () => {
    expect(objloc).toBeTruthy();
  });

  it('writeJSONobject and onSetdata', () => {
    objloc.Name = 'test1';
    objloc.IsDevice = false;
    objloc.Desp = 'desp';
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
