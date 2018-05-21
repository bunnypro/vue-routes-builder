export function pipe<T>(value: T, ...pipes: ((value: T) => T)[]): T {
  return pipes.reduce((val, pipe) => {
    return pipe(val);
  }, value);
}
