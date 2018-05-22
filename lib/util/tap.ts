export function tap<T>(value: T, ...fns: ((value: T) => void)[]): T {
  fns.forEach(fn => fn(value));
  return value;
}

export async function tapAsync<T>(value: T, ...fns: ((value: T) => Promise<void>)[]): Promise<T> {
  for (const fn of fns) {
    await fn(value);
  }

  return value;
}
