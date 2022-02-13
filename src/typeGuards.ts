// eslint-disable-next-line @typescript-eslint/ban-types
export function hasKey<O extends object, K extends string>(
  obj: O,
  key: K,
): obj is O & Record<K, unknown> {
  return key in obj;
}
