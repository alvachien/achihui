import { SafeAny } from "./any";

export interface IndexableObject {
    [key: string]: SafeAny;
}
