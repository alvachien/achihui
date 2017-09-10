import { environment } from '../../environments/environment';
import * as hih from './common';

export class Person extends hih.MultipleNamesObject {
    public Id: number;
}

export class Location {
    public Id: number;
    public Name: string;
    public Detail: string;
}

export class BookCategory {
    public Id: number;
    public Name: string;
}
export class Book extends hih.MultipleNamesObject {
    public Authors: Person[];
    public Categories: BookCategory[];
    public PublishDate: Date;
    public Locations: Location[];
}

export class MovieCategory {
    public Id: number;
    public Name: string;
}
export class Movie extends hih.MultipleNamesObject {
    public Categories: MovieCategory[];
    public Directors: Person[];
    public Actors: Person[];
    public PublishDate: Date;
    public Locations: Location[];
}
