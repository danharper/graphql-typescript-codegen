// https://github.com/microsoft/TypeScript/issues/16069
export const isPresent = <T>(input: null | undefined | T): input is T =>
  input != null;

export function invariant(input: unknown, message: string): asserts input {
  if (!input) {
    invariantViolation(message);
  }
}

export function invariantViolation(
  message: string = 'Invariant violation',
): never {
  throw new Error(message);
}

export function assertUnreachable(_x: never): never {
  invariantViolation("Didn't expect to get here");
}

export function mapObjectValues<TIn, TOut>(
  input: Record<string, TIn>,
  fn: (item: TIn) => TOut,
): Record<string, TOut> {
  const output: Record<string, TOut> = {};
  for (const key in input) {
    output[key] = fn(input[key]);
  }
  return output;
}
