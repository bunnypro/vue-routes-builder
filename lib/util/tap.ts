export function tap(value: any, fn: (value: any) => void) {
    fn(value);
    return value;
}