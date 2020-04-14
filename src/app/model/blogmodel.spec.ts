//
// Unit test for blogmodel.ts
//

import { BlogPost, BlogCollection } from './blogmodel';

describe('BlogCollection', () => {
  let instance: BlogCollection;

  beforeEach(() => {
    instance = new BlogCollection();
  });

  it('shall work', () => {
    expect(instance).toBeTruthy();
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
});
