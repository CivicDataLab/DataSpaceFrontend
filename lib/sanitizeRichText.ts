import sanitizeHtml from 'sanitize-html';

/**
 * HTML the rich-text editor can produce. Anything else — event handlers,
 * scripts, javascript: URLs — is removed before it is inserted into the page.
 */
const ALIGN = ['ql-align-center', 'ql-align-right', 'ql-align-justify'];
const INDENT = Array.from(
  { length: 8 },
  (_, level) => `ql-indent-${level + 1}`
);
const LIST_KINDS = new Set(['bullet', 'ordered', 'checked', 'unchecked']);

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'a',
    'b',
    'blockquote',
    'br',
    'em',
    'h1',
    'h2',
    'h3',
    'i',
    'img',
    'li',
    'ol',
    'p',
    's',
    'span',
    'strong',
    'u',
    'ul',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt'],
    ol: ['start'],
    li: ['data-list', 'class'],
    p: ['class'],
    h1: ['class'],
    h2: ['class'],
    h3: ['class'],
    blockquote: ['class'],
    span: ['class'],
  },
  allowedClasses: {
    p: ALIGN,
    h1: ALIGN,
    h2: ALIGN,
    h3: ALIGN,
    blockquote: ALIGN,
    li: [...ALIGN, ...INDENT],
    span: ['ql-ui'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https'],
  },
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    li: (tagName, attribs) => {
      const kind = attribs['data-list'];
      if (kind && !LIST_KINDS.has(kind)) {
        delete attribs['data-list'];
      }
      return { tagName, attribs };
    },
  },
};

export function sanitizeRichText(content: string | null | undefined): string {
  if (!content) return '';
  return sanitizeHtml(content, OPTIONS);
}
