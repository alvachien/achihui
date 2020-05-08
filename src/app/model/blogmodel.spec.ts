//
// Unit test for blogmodel.ts
//

import { BlogPost, BlogCollection, BlogCollectionAPIJson, BlogPostAPIJson,
  BlogPostTag, BlogPostTagAPIJson, } from './blogmodel';

describe('BlogCollection', () => {
  let instance: BlogCollection;

  beforeEach(() => {
    instance = new BlogCollection();
  });

  it('shall work', () => {
    expect(instance).toBeTruthy();
  });
  it('writeAPIJwson and onSetData', () => {
    instance.id = 1;
    instance.name = 'a';
    instance.comment = 'b';
    instance.owner = 'c';

    const apijson: BlogCollectionAPIJson = instance.writeAPIJson();
    expect(apijson.ID).toEqual(instance.id);
    expect(apijson.Name).toEqual(instance.name);
    expect(apijson.Comment).toEqual(instance.comment);
    expect(apijson.Owner).toEqual(instance.owner);

    const instance2: BlogCollection = new BlogCollection();
    instance2.onSetData(apijson);
    expect(instance2.comment).toEqual(instance.comment);
    expect(instance2.id).toEqual(instance.id);
    expect(instance2.name).toEqual(instance.name);
    expect(instance2.comment).toEqual(instance.comment);
  });
});

describe('BlogPost', () => {
  let instance: BlogPost;

  beforeEach(() => {
    instance = new BlogPost();
  });

  it('shall work', () => {
    expect(instance).toBeTruthy();
  });
  it('writeAPIJson and onSetData', () => {
    instance.id = 1;
    instance.format = 1;
    instance.owner = 'a';
    instance.title = 'b';
    instance.brief = 'd';
    instance.content = 'c';

    const apidata: BlogPostAPIJson = instance.writeAPIJson();
    expect(apidata).toBeTruthy();
    expect(apidata.ID).toEqual(instance.id);
    expect(apidata.Format).toEqual(instance.format);
    expect(apidata.Owner).toEqual(instance.owner);
    expect(apidata.Brief).toEqual(instance.brief);
    expect(apidata.Title).toEqual(instance.title);
    expect(apidata.Content).toEqual(instance.content);

    const instance2: BlogPost = new BlogPost();
    instance2.onSetData(apidata);
    expect(instance.id).toEqual(instance2.id);
    expect(instance.format).toEqual(instance2.format);
    expect(instance.owner).toEqual(instance2.owner);
    expect(instance.title).toEqual(instance2.title);
    expect(instance.brief).toEqual(instance2.brief);
    expect(instance.content).toEqual(instance2.content);
  });
});

describe('BlogPostTag', () => {
  let instance: BlogPostTag;

  beforeEach(() => {
    instance = new BlogPostTag();
  });

  it('shall work', () => {
    expect(instance).toBeTruthy();
  });
  it('writeAPIJson and onSetData', () => {
    instance.postID = 1;
    instance.tag = 'a';

    const apijson: BlogPostTagAPIJson = instance.writeAPIJson();
    expect(apijson.PostID).toEqual(instance.postID);
    expect(apijson.Tag).toEqual(instance.tag);

    const instance2: BlogPostTag = new BlogPostTag();
    instance2.onSetData(apijson);
    expect(instance2.postID).toEqual(instance.postID);
    expect(instance2.tag).toEqual(instance.tag);
  });
});
