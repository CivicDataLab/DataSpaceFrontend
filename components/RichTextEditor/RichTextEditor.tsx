'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  placeholder?: string;
  label?: string;
  helpText?: string;
  readOnly?: boolean;
  showPreview?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onBlur,
  placeholder = 'Enter description...',
  label,
  helpText,
  readOnly = false,
}) => {
  const [isPreview, setIsPreview] = useState(false);
  // Dynamically import ReactQuill to avoid SSR issues
  const ReactQuill = useMemo(
    () =>
      dynamic(() => import('react-quill-new'), {
        ssr: false,
        loading: () => (
          <div className="bg-gray-100 rounded h-40 animate-pulse" />
        ),
      }),
    []
  );

  // Custom image handler to use URLs instead of base64
  const imageHandler = function (this: {
    quill: {
      getSelection: () => { index: number } | null;
      insertEmbed: (index: number, type: string, url: string) => void;
    };
  }) {
    const url = prompt('Enter image URL:');
    if (url) {
      const quill = this.quill;
      const range = quill.getSelection();
      if (range) {
        quill.insertEmbed(range.index, 'image', url);
      }
    }
  };

  const modules = useMemo(
    () => ({
      toolbar: readOnly
        ? false
        : {
            container: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ indent: '-1' }, { indent: '+1' }],
              ['link', 'image'],
              [{ align: [] }],
              ['clean'],
              ['preview'], // Custom preview button
            ],
            handlers: {
              preview: () => setIsPreview(!isPreview),
              image: imageHandler,
            },
          },
      clipboard: {
        matchVisual: false,
      },
    }),
    [readOnly, isPreview]
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'align',
  ];

  return (
    <div className="w-full">
      {label && (
        <label className="text-sm text-gray-700 mb-2 block font-medium">
          {label}
        </label>
      )}

      {isPreview ? (
        <div className="rounded-md border border-gray-300 min-h-[200px] bg-white">
          <div className="border-b border-gray-300 bg-gray-50 flex items-center justify-between px-4 py-2">
            <span className="text-sm text-gray-700 font-medium">Preview</span>
            <button
              type="button"
              onClick={() => setIsPreview(false)}
              className="rounded text-sm text-gray-700 hover:bg-gray-200 flex items-center gap-1 px-2 py-1 font-medium"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Back to Edit
            </button>
          </div>
          <div className="p-4">
            <div
              className="ql-editor preview-content"
              dangerouslySetInnerHTML={{
                __html:
                  value || '<p class="text-gray-400">No content to preview</p>',
              }}
            />
          </div>
        </div>
      ) : (
        <div
          className={`rich-text-editor bhashini-skip-translation ${readOnly ? 'read-only' : ''}`}
        >
          <ReactQuill
            theme="snow"
            value={value || ''}
            onChange={(content) => {
              const stripped = content.replace(/<(.|\n)*?>/g, '').trim();
              onChange(stripped === '' ? '' : content);
            }}
            onBlur={(_range, _source, editor) => {
              const html = editor?.getHTML?.() || value || '';
              const stripped = html.replace(/<(.|\n)*?>/g, '').trim();
              onBlur?.(stripped === '' ? '' : html);
            }}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            readOnly={readOnly}
            className={readOnly ? 'quill-readonly' : ''}
          />
        </div>
      )}

      {helpText && <p className="text-sm text-gray-500 mt-1">{helpText}</p>}
      <style jsx global>{`
        .rich-text-editor .quill {
          background: white;
          border-radius: 4px;
        }

        .rich-text-editor .ql-container {
          min-height: 200px;
          font-size: 14px;
          border-bottom-left-radius: 4px;
          border-bottom-right-radius: 4px;
        }

        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
          background: #f8f9fa;
        }

        .rich-text-editor.read-only .ql-toolbar {
          display: none;
        }

        .rich-text-editor.read-only .ql-container {
          border: none;
        }

        .rich-text-editor .ql-editor {
          min-height: 200px;
        }

        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }

        /* Custom preview button in toolbar */
        .rich-text-editor .ql-toolbar .ql-preview {
          width: auto !important;
        }

        .rich-text-editor .ql-toolbar .ql-preview::before {
          content: '👁️ Preview';
          font-size: 13px;
          padding: 0 8px;
        }

        .rich-text-editor .ql-toolbar .ql-preview:hover {
          color: #2563eb;
        }

        .rich-text-editor .ql-toolbar button.ql-preview {
          background: transparent;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .rich-text-editor + p {
          font-size: 12px;
        }

        .preview-content {
          padding: 0;
          min-height: 200px;
        }

        .preview-content p {
          margin-bottom: 1em;
        }

        .preview-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 0.5em;
        }

        .preview-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-bottom: 0.5em;
        }

        .preview-content h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin-bottom: 0.5em;
        }

        .preview-content ul,
        .preview-content ol {
          padding-left: 1.5em;
          margin-bottom: 1em;
        }

        .preview-content li {
          margin-bottom: 0.25em;
        }

        .preview-content a {
          color: #3b82f6;
          text-decoration: underline;
        }

        .preview-content a:hover {
          color: #2563eb;
        }

        .preview-content img {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
        }

        .preview-content strong {
          font-weight: bold;
        }

        .preview-content em {
          font-style: italic;
        }

        .preview-content u {
          text-decoration: underline;
        }

        .preview-content s {
          text-decoration: line-through;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
