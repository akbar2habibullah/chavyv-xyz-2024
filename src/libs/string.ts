export function trimNewlines(input: string): string {
  return input.replace(/^\s+|\s+$/g, '');
}