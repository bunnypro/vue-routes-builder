import { RecursiveArray } from "./common";

export function flatten<T>(items: RecursiveArray<T>): T[] {
  return items.reduce<T[]>((results, item) => {
    return results.concat(item instanceof Array ? flatten(item) : item);
  }, []);
}
