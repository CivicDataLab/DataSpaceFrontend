export function isRichTextEmpty(html?: string | null): boolean {
  if (!html) return true;
  return html.replace(/<(.|\n)*?>/g, '').trim().length === 0;
}
