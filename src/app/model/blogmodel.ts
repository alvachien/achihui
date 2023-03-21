import * as moment from 'moment';
import { momentDateFormat } from './common';

/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
export const BlogPostStatus_Draft = 1;
export const BlogPostStatus_PublishAsPublic = 2;
export const BlogPostStatus_PublishAsPrivate = 3;
export const BlogPostStatus_Deleted = 4;

/**
 * User Setting
 */
export interface BlogUserSettingAPIJson {
  Owner?: string;
  Name?: string;
  Comment?: string;
  AllowComment?: boolean;
  DeployFolder?: string;
  Author?: string;
  AuthorDesp?: string;
  AuthorImage?: string;
}

export class BlogUserSetting {
  owner: string;
  title: string;
  footer: string | null = null;
  deploy: string;
  author: string;
  authordesp: string | null = null;
  authorimage: string | null = null;

  constructor() {
    this.owner = '';
    this.title = '';
    this.author = '';
    this.deploy = '';
  }
  public onSetData(data: BlogUserSettingAPIJson): void {
    if (data) {
      this.owner = data.Owner ? data.Owner : '';
      this.title = data.Name ? data.Name : '';
      if (data.Comment) {
        this.footer = data.Comment;
      }
      this.deploy = data.DeployFolder ? data.DeployFolder : '';
      this.author = data.Author ? data.Author : '';
      if (data.AuthorDesp) {
        this.authordesp = data.AuthorDesp;
      }
      if (data.AuthorImage) {
        this.authorimage = data.AuthorImage;
      }
    }
  }
  public writeAPIJson(): BlogUserSettingAPIJson {
    const jdata: BlogUserSettingAPIJson = {
      Owner: this.owner,
      Name: this.title,
      DeployFolder: this.deploy,
      Author: this.author,
    };
    if (this.footer) {
      jdata.Comment = this.footer;
    }
    if (this.authordesp) {
      jdata.AuthorDesp = this.authordesp;
    }
    if (this.authorimage) {
      jdata.AuthorImage = this.authorimage;
    }
    return jdata;
  }
}

/**
 * Blog Collection
 */
export interface BlogCollectionAPIJson {
  ID: number;
  Owner: string;
  Name: string;
  Comment?: string;
}

export class BlogCollection {
  public id = -1;
  public owner = '';
  public name = '';
  public comment: string | null = null;

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
      Comment: this.comment ? this.comment : undefined,
    } as BlogCollectionAPIJson;
  }
}

export class BlogPostCollection {
  public PostID = -1;
  public CollectionID = -1;
}

/**
 * Blog Post
 */
export interface BlogPostAPIJson {
  ID?: number;
  Owner?: string;
  Format?: number;
  Title?: string;
  Brief?: string;
  Content?: string;
  Status?: number;
  CreatedAt?: any;
  UpdatedAt?: any;
  BlogPostCollections: BlogPostCollection[];
  BlogPostTags: BlogPostTag[];
}

export class BlogPost {
  public id?: number;
  public owner?: string;
  public format?: number;
  public title?: string;
  public brief?: string;
  public content?: string;
  public status?: number;
  public createdAt?: moment.Moment;
  public updatedAt?: moment.Moment;
  public BlogPostCollections: BlogPostCollection[];
  public BlogPostTags: BlogPostTag[];

  constructor() {
    this.BlogPostCollections = [];
    this.BlogPostTags = [];
  }

  get createdAtString(): string {
    if (this.createdAt) {
      return this.createdAt.format(momentDateFormat);
    }
    return '';
  }

  public onSetData(data: BlogPostAPIJson) {
    if (data) {
      this.id = data.ID;
      this.owner = data.Owner;
      this.format = data.Format;
      this.title = data.Title;
      this.brief = data.Brief;
      this.content = data.Content;
      this.status = data.Status;
      this.BlogPostCollections = data.BlogPostCollections;
      this.BlogPostTags = data.BlogPostTags;

      if (data.CreatedAt) {
        this.createdAt = moment(data.CreatedAt);
      }
      if (data.UpdatedAt) {
        this.updatedAt = moment(data.UpdatedAt);
      }
    }
  }
  public writeAPIJson(): BlogPostAPIJson {
    const rtnjson: BlogPostAPIJson = {
      ID: this.id,
      Owner: this.owner,
      Format: this.format,
      Title: this.title,
      Brief: this.brief,
      Content: this.content,
      Status: this.status,
      BlogPostCollections: this.BlogPostCollections,
      BlogPostTags: this.BlogPostTags,
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
export class BlogPostTag {
  PostID?: number;
  Tag?: string;
}
