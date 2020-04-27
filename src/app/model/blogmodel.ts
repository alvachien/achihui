import * as moment from 'moment';

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
}

/**
 * Blog Post
 */
export interface BlogPostAPIJson {
  ID: number;
  Owner: string;
  Format: number;
  Title: string;
  Content: string;
  Status: number;
  CreatedAt?: any;
  UpdatedAt?: any;
}

export class BlogPost {
  public id: number;
  public owner: string;
  public format: number;
  public title: string;
  public content: string;
  public status: number;
  public createdAt?: moment.Moment;
  public updatedAt?: moment.Moment;

  public onSetData(data: BlogPostAPIJson) {
    if (data) {
      this.id = +data.ID;
      this.owner = data.Owner;
      this.format = data.Format;
      this.title = data.Title;
      this.content = data.Content;
      this.status = data.Status;
      if (data.CreatedAt) {        
      }
      if (data.UpdatedAt) {
      }
    }
  }
  public writeAPIJson(): BlogPostAPIJson {
    return {
      ID: this.id,
      Owner: this.owner,
      Format: this.format,
      Title: this.title,
      Content: this.content,
      Status: this.status
    } as BlogPostAPIJson;
  }
}
