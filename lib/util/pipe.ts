export function pipe<T>(value: T, ...pipes: ((value: T) => T)[]): T {
  return pipes.reduce((val, pipe) => {
    return pipe(val);
  }, value);
}

export async function pipeAsync<T>(value: T, ...pipes: ((value: T) => Promise<T>)[]): Promise<T> {
  let result = value;

  for (const pipe of pipes) {
    result = await pipe(result);
  }

  return result;
}
