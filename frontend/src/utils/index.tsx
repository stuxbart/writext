export function replaceCRLF(text: string) {
  return text.replace(/\r/gm, "");
}
