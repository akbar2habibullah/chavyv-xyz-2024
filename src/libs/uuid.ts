import ShortUniqueId from "short-unique-id";

export function getUUID(length: number = 10) {
  const uid = new ShortUniqueId({ length });

  const uuid = uid.rnd();

  return uuid
}