import { RecursiveArray } from "./common";
import { flatten } from "./flatten";

export function flatMap<T, TResult>(items: T[], fn: (item: T) => RecursiveArray<TResult>): TResult[] {
  return flatten(items.map(fn));
}
