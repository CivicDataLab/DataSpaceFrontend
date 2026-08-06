'use client';

import React from 'react';

import 'react-quill-new/dist/quill.snow.css';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
  className = '',
}) => {
  const rawContent = content || '';

  // Normalize non-breaking spaces only when we detect overflow-prone content
  // (e.g. very long runs of nbsp that prevent wrapping).
  const hasOverflowRiskNbsp =
    /(?:&nbsp;|\u00A0){6,}/.test(rawContent) ||
    /(?:\w(?:&nbsp;|\u00A0)){12,}\w/i.test(rawContent) ||
    (rawContent.match(/&nbsp;|\u00A0/g)?.length ?? 0) >= 10

  const normalizedContent = hasOverflowRiskNbsp
    ? rawContent.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ')
    : rawContent;

  return (
    <div className={`rich-text-content ${className}`}>
      <div
        className="ql-editor"
        dangerouslySetInnerHTML={{ __html: normalizedContent }}
      />
      <style jsx global>{`
        .rich-text-content .ql-editor {
          max-width: 100%;
          overflow-wrap: anywhere;
          word-break: break-word;
          padding: 0;
          font-size: 14px;
          line-height: 1.6;
        }

        .rich-text-content .ql-editor p {
          margin-bottom: 1em;
        }

        .rich-text-content .ql-editor h1 {
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 0.5em;
        }

        .rich-text-content .ql-editor h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-bottom: 0.5em;
        }

        .rich-text-content .ql-editor h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-bottom: 0.5em;
        }

        .rich-text-content .ql-editor ul,
        .rich-text-content .ql-editor ol {
          list-style-position: outside;
          padding-left: 1.5em;
          margin-bottom: 1em;
        }

        .rich-text-content .ql-editor ul {
          list-style-type: disc !important;
        }

        .rich-text-content .ql-editor ul ul {
          list-style-type: circle !important;
        }

        .rich-text-content .ql-editor ol {
          list-style-type: decimal !important;
        }

        .rich-text-content .ql-editor li {
          margin-bottom: 0.25em;
        }

        /*
         * Keep Quill-managed lists (li[data-list]) untouched.
         * Only normalize plain HTML lists from backend content.
         */
        .rich-text-content .ql-editor ul > li:not([data-list]),
        .rich-text-content .ql-editor ol > li:not([data-list]) {
          display: list-item !important;
          list-style-type: inherit !important;
          padding-left: 0 !important;
        }

        .rich-text-content .ql-editor li:not([data-list])::before {
          content: none !important;
        }

        .rich-text-content .ql-editor a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .rich-text-content .ql-editor a:hover {
          color: #2563eb;
        }

        .rich-text-content.text-white .ql-editor a {
          color: #60a5fa;
        }

        .rich-text-content.text-white .ql-editor a:hover {
          color: #93c5fd;
        }

        .rich-text-content .ql-editor img {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
        }

        .rich-text-content .ql-editor strong,
        .rich-text-content .ql-editor b {
          font-weight: 700 !important;
        }

        .rich-text-content .ql-editor em {
          font-style: italic;
        }

        .rich-text-content .ql-editor u {
          text-decoration: underline;
        }

        .rich-text-content .ql-editor s {
          text-decoration: line-through;
        }
      `}</style>
    </div>
  );
};

export default RichTextRenderer;
