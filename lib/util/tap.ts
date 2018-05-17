export function tap<T>(value: T, ...fns: ((value: T) => void | Promise<any>)[]): T {
  fns.forEach(async (fn) => {
    const result = fn(value);

    if (result instanceof Promise) {
      await result;
    }
  });
  return value;
}
