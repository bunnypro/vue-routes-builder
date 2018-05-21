import { RecursiveArray } from "./common";
import { flatten } from "./flatten";

export function flattenMap<T, TResult>(items: Array<T>, fn: (item: T) => RecursiveArray<TResult>): TResult[] {
  return flatten(items.map(fn));
}
