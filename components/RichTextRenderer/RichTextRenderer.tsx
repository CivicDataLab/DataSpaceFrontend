'use client';

import React from 'react';
import 'react-quill/dist/quill.snow.css';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
  className = '',
}) => {
  return (
    <div className={`rich-text-content ${className}`}>
      <div
        className="ql-editor"
        dangerouslySetInnerHTML={{ __html: content || '' }}
      />
      <style jsx global>{`
        .rich-text-content .ql-editor {
          padding: 0;
          font-size: 16px;
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
          padding-left: 1.5em;
          margin-bottom: 1em;
        }
        
        .rich-text-content .ql-editor li {
          margin-bottom: 0.25em;
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
        
        .rich-text-content .ql-editor strong {
          font-weight: bold;
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
