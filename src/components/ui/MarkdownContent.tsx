import React from 'react';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Renders inline formatting (**bold**, *italic*, `code`) safely without exposing raw tokens.
 */
function renderInline(text: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return tokens.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-[#18181B]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={idx} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-[#F4F4F6] text-[0.875em] font-mono text-[#18181B]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

/**
 * Lightweight, safe semantic Markdown renderer for opportunity briefs and generated docs.
 */
export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  className = '',
}) => {
  const lines = content.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let listItems: { ordered: boolean; text: string }[] = [];
  let paragraphLines: string[] = [];

  const flushParagraph = (key: string) => {
    if (paragraphLines.length === 0) return;
    blocks.push(
      <p key={key} className="text-sm text-[#52525B] leading-relaxed max-w-[65ch]">
        {renderInline(paragraphLines.join(' '))}
      </p>
    );
    paragraphLines = [];
  };

  const flushList = (key: string) => {
    if (listItems.length === 0) return;
    const isOrdered = listItems[0].ordered;
    const Tag = isOrdered ? 'ol' : 'ul';
    blocks.push(
      <Tag
        key={key}
        className={`space-y-2 text-sm text-[#52525B] leading-relaxed max-w-[65ch] ${
          isOrdered ? 'list-decimal ps-5' : 'list-disc ps-5'
        }`}
      >
        {listItems.map((item, idx) => (
          <li key={idx} className="ps-1 marker:text-[#63636B] marker:font-semibold">
            {renderInline(item.text)}
          </li>
        ))}
      </Tag>
    );
    listItems = [];
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph(`p-${index}`);
      flushList(`list-${index}`);
      return;
    }

    if (line.startsWith('### ')) {
      flushParagraph(`p-${index}`);
      flushList(`list-${index}`);
      blocks.push(
        <h3
          key={`h3-${index}`}
          className="text-sm font-semibold text-[#18181B] tracking-tight pt-2 first:pt-0"
        >
          {renderInline(line.slice(4))}
        </h3>
      );
      return;
    }

    if (line.startsWith('## ')) {
      flushParagraph(`p-${index}`);
      flushList(`list-${index}`);
      blocks.push(
        <h2
          key={`h2-${index}`}
          className="text-base font-semibold text-[#18181B] tracking-tight pt-3 first:pt-0"
        >
          {renderInline(line.slice(3))}
        </h2>
      );
      return;
    }

    if (line.startsWith('# ')) {
      flushParagraph(`p-${index}`);
      flushList(`list-${index}`);
      blocks.push(
        <h2
          key={`h1-${index}`}
          className="text-lg font-semibold text-[#18181B] tracking-tight pt-2 first:pt-0"
        >
          {renderInline(line.slice(2))}
        </h2>
      );
      return;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph(`p-${index}`);
      if (listItems.length > 0 && !listItems[0].ordered) {
        flushList(`list-${index}`);
      }
      listItems.push({ ordered: true, text: orderedMatch[1] });
      return;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      flushParagraph(`p-${index}`);
      if (listItems.length > 0 && listItems[0].ordered) {
        flushList(`list-${index}`);
      }
      listItems.push({ ordered: false, text: line.slice(2) });
      return;
    }

    flushList(`list-${index}`);
    paragraphLines.push(line);
  });

  flushParagraph('p-end');
  flushList('list-end');

  return <div className={`space-y-3 ${className}`}>{blocks}</div>;
};
