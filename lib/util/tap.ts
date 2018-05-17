export function tap<T>(value: T, ...fns: ((value: T) => void)[]): T {
  fns.forEach(fn => fn(value));
  return value;
}
