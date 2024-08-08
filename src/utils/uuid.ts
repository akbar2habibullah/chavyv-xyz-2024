import ShortUniqueId from "short-unique-id";

export function getUUID(length: number = 10): string {
  const uid = new ShortUniqueId({ length });

  const uuid = uid.rnd();

  return uuid
}