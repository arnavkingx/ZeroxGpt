import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className="space-y-3 leading-relaxed text-gray-900 text-sm md:text-base break-words">
      {blocks.map((block, index) => {
        if (block.type === 'code') {
          return <CodeBlock key={index} code={block.content} language={block.language || 'code'} />;
        }
        return <TextBlock key={index} text={block.content} />;
      })}
    </div>
  );
};

interface Block {
  type: 'code' | 'text';
  content: string;
  language?: string;
}

function parseMarkdownBlocks(markdown: string): Block[] {
  const blocks: Block[] = [];
  const lines = markdown.split('\n');

  let inCode = false;
  let codeLang = '';
  let codeBuffer: string[] = [];
  let textBuffer: string[] = [];

  const flushText = () => {
    if (textBuffer.length > 0) {
      blocks.push({
        type: 'text',
        content: textBuffer.join('\n'),
      });
      textBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (!inCode) {
        flushText();
        inCode = true;
        codeLang = line.replace('```', '').trim();
        codeBuffer = [];
      } else {
        inCode = false;
        blocks.push({
          type: 'code',
          content: codeBuffer.join('\n'),
          language: codeLang,
        });
        codeBuffer = [];
      }
    } else if (inCode) {
      codeBuffer.push(line);
    } else {
      textBuffer.push(line);
    }
  }

  if (inCode && codeBuffer.length > 0) {
    blocks.push({
      type: 'code',
      content: codeBuffer.join('\n'),
      language: codeLang,
    });
  } else {
    flushText();
  }

  return blocks;
}

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-800 bg-[#1e1e24] my-3 shadow-md">
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#141418] border-b border-gray-800 text-xs text-gray-400">
        <span className="font-mono uppercase font-semibold tracking-wider text-cyan-400 text-[11px]">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-gray-200 transition-colors cursor-pointer text-xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-xs md:text-sm font-mono text-gray-100 leading-normal">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const TextBlock: React.FC<{ text: string }> = ({ text }) => {
  const paragraphs = text.split(/\n\s*\n/);

  return (
    <div className="space-y-2.5">
      {paragraphs.map((p, pIdx) => {
        const trimmed = p.trim();
        if (!trimmed) return null;

        // Header 3
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={pIdx} className="text-base md:text-lg font-bold text-gray-900 mt-4 mb-1">
              <InlineText text={trimmed.replace(/^###\s+/, '')} />
            </h3>
          );
        }
        // Header 2
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={pIdx} className="text-lg md:text-xl font-bold text-gray-900 mt-5 mb-2 pb-1 border-b border-gray-200">
              <InlineText text={trimmed.replace(/^##\s+/, '')} />
            </h2>
          );
        }
        // Header 1
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={pIdx} className="text-xl md:text-2xl font-black text-gray-900 mt-6 mb-3 pb-1 border-b border-gray-200">
              <InlineText text={trimmed.replace(/^#\s+/, '')} />
            </h1>
          );
        }

        // Blockquote
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={pIdx}
              className="border-l-3 border-cyan-600 bg-cyan-50/60 pl-3.5 py-1.5 text-gray-700 italic rounded-r-md text-sm"
            >
              <InlineText text={trimmed.replace(/^>\s*/, '')} />
            </blockquote>
          );
        }

        // Unordered list
        if (trimmed.includes('\n- ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split('\n').filter((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '));
          return (
            <ul key={pIdx} className="list-disc pl-5 space-y-1 text-gray-800">
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <InlineText text={item.replace(/^[-*]\s+/, '')} />
                </li>
              ))}
            </ul>
          );
        }

        // Ordered list
        if (trimmed.includes('\n1. ') || /^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split('\n').filter((l) => /^\d+\.\s/.test(l.trim()));
          return (
            <ol key={pIdx} className="list-decimal pl-5 space-y-1 text-gray-800">
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <InlineText text={item.replace(/^\d+\.\s+/, '')} />
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={pIdx} className="whitespace-pre-line text-gray-800">
            <InlineText text={p} />
          </p>
        );
      })}
    </div>
  );
};

const InlineText: React.FC<{ text: string }> = ({ text }) => {
  const tokens: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push(
        <strong key={match.index} className="font-semibold text-gray-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      tokens.push(
        <em key={match.index} className="italic text-gray-700">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      tokens.push(
        <code
          key={match.index}
          className="bg-gray-100 text-cyan-900 border border-gray-200 px-1.5 py-0.5 rounded font-mono text-[12px] md:text-[13px]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const linkMatch = token.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        tokens.push(
          <a
            key={match.index}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-700 hover:text-cyan-800 underline underline-offset-2"
          >
            {linkMatch[1]}
          </a>
        );
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.substring(lastIndex));
  }

  return <>{tokens}</>;
};
