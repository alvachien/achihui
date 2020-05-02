import * as moment from 'moment';
import { momentDateFormat } from './common';

export const BlogPostStatus_Draft: number = 1;
export const BlogPostStatus_PublishAsPublic: number = 2;
export const BlogPostStatus_PublishAsPrivate: number = 3;
export const BlogPostStatus_Deleted: number = 4;

/**
 * Blog Collection
 */
export class BlogCollectionAPIJson {
  ID: number;
  Owner: string;
  Name: string;
  Comment?: string;
}

export class BlogCollection {
  public id: number;
  public owner: string;
  public name: string;
  public comment?: string;

  constructor() {
    this.comment = null;
  }

  public onSetData(data: BlogCollectionAPIJson): void {    
    if (data) {
      this.id = +data.ID;
      this.owner = data.Owner;
      this.name = data.Name;
      if (data.Comment) {
        this.comment = data.Comment;
      } else {
        this.comment = null;
      }
    }
  }
  public writeAPIJson(): BlogCollectionAPIJson {
    return {
      ID: this.id,
      Owner: this.owner,
      Name: this.name,
      Comment: this.comment
    } as BlogCollectionAPIJson;
  }
}

export class BlogPostCollection {
  public PostID: number;
  public CollectionID: number;
}

/**
 * Blog Post
 */
export interface BlogPostAPIJson {
  ID: number;
  Owner: string;
  Format: number;
  Title: string;
  Brief: string;
  Content: string;
  Status: number;
  CreatedAt?: any;
  UpdatedAt?: any;
  BlogPostCollections: BlogPostCollection[];
}

export class BlogPost {
  public id: number;
  public owner: string;
  public format: number;
  public title: string;
  public brief: string;
  public content: string;
  public status: number;
  public createdAt?: moment.Moment;
  public updatedAt?: moment.Moment;
  public BlogPostCollections: BlogPostCollection[];

  constructor() {
    this.BlogPostCollections = [];
  }

  get createdAtString(): string {
    if (this.createdAt) {
      return this.createdAt.format(momentDateFormat);
    }
  }

  public onSetData(data: BlogPostAPIJson) {
    if (data) {
      this.id = +data.ID;
      this.owner = data.Owner;
      this.format = data.Format;
      this.title = data.Title;
      this.brief = data.Brief;
      this.content = data.Content;
      this.status = data.Status;
      this.BlogPostCollections = data.BlogPostCollections;

      if (data.CreatedAt) {
        this.createdAt = moment(data.CreatedAt);
      }
      if (data.UpdatedAt) {
        this.updatedAt = moment(data.UpdatedAt);
      }
    }
  }
  public writeAPIJson(): BlogPostAPIJson {
    let rtnjson: BlogPostAPIJson = {
      ID: this.id,
      Owner: this.owner,
      Format: this.format,
      Title: this.title,
      Brief: this.brief,
      Content: this.content,
      Status: this.status,
      BlogPostCollections: this.BlogPostCollections,
    };
    if (this.createdAt) {
      rtnjson.CreatedAt = this.createdAt ? this.createdAt.format(momentDateFormat) : '';
    }
    if (this.updatedAt) {
      rtnjson.UpdatedAt = this.updatedAt ? this.updatedAt.format(momentDateFormat) : '';
    }

    return rtnjson;
  }
}

/**
 * Blog post tag
 */
export class BlogPostTagAPIJson {
  PostID: number;
  Tag: string;
}

export class BlogPostTag {
  postID: number;
  tag: string;

  public onSetData(data: BlogPostTagAPIJson) {
    if (data) {
      this.postID = +data.PostID;
      this.tag = data.Tag;
    }
  }
  public writeAPIJson(): BlogPostTagAPIJson {
    return {
      PostID: this.postID,
      Tag: this.tag,
    } as BlogPostTagAPIJson;
  }
}
