//
// Unit test for librarymodel.ts
//

import { Location, BookCategory, MovieGenre } from './librarymodel';

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
    let jdata = objloc.writeJSONObject();
    expect(jdata).toBeTruthy();

    let objloc2: Location = new Location();
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

    expect(bkctgy.ID).toBeUndefined();
    expect(bkctgy.HID).toBeUndefined();
    expect(bkctgy.Name).toBeUndefined();
    expect(bkctgy.Others).toBeUndefined();
  });

  it('writeJSONobject and onSetdata', () => {
    bkctgy.Name = 'test1';
    bkctgy.Others = 'others';
    let jdata = bkctgy.writeJSONObject();
    expect(jdata).toBeTruthy();

    let bkctgy2: BookCategory = new BookCategory();
    bkctgy2.onSetData(jdata);
    expect(bkctgy2).toBeTruthy();
  });
});

describe('MovieGenre', () => {
  let mvgen: MovieGenre;

  beforeEach(() => {
    mvgen = new MovieGenre();
  });

  it('init', () => {
    expect(mvgen).toBeTruthy();

    expect(mvgen.ID).toBeUndefined();
    expect(mvgen.HID).toBeUndefined();
    expect(mvgen.Name).toBeUndefined();
    expect(mvgen.Others).toBeUndefined();
  });
  it('writeJSONobject and onSetdata', () => {
    mvgen.Name = 'test1';
    mvgen.Others = 'others';
    let jdata = mvgen.writeJSONObject();
    expect(jdata).toBeTruthy();

    let mvgen2: MovieGenre = new MovieGenre();
    mvgen2.onSetData(jdata);
    expect(mvgen2).toBeTruthy();
  });
});
