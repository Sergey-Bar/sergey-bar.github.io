/** Sections are ordered by document position; gaps belong to the preceding section. */
export function activeSection(sections: readonly { href: string; top: number }[], line: number): string | null {
  let active: string | null = null;
  for (const section of sections) {
    if (section.top > line) break;
    active = section.href;
  }
  return active;
}
