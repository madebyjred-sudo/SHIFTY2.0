import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, Terminal, Code2, FileJson, FileCode2, Database, Globe, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

const getLanguageIcon = (lang: string) => {
  const language = lang.toLowerCase();
  if (['js', 'javascript', 'jsx', 'ts', 'typescript', 'tsx'].includes(language)) {
    return <FileCode2 className="w-4 h-4 text-yellow-400" />;
  }
  if (['html', 'xml'].includes(language)) {
    return <Globe className="w-4 h-4 text-orange-500" />;
  }
  if (['css', 'scss', 'less'].includes(language)) {
    return <Code2 className="w-4 h-4 text-blue-400" />;
  }
  if (['json'].includes(language)) {
    return <FileJson className="w-4 h-4 text-green-400" />;
  }
  if (['sql', 'mysql', 'postgresql'].includes(language)) {
    return <Database className="w-4 h-4 text-blue-300" />;
  }
  if (['python', 'py'].includes(language)) {
    return <Cpu className="w-4 h-4 text-yellow-500" />;
  }
  return <Terminal className="w-4 h-4 text-slate-400" />;
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors"
      title="Copy code"
    >
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

export function MessageRenderer({ content, isUser }: { content: string; isUser?: boolean }) {
  return (
    <div className={cn("markdown-body", isUser ? "text-current" : "text-current")}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            if (!inline && match) {
              return (
                <div className="relative my-4 rounded-xl overflow-hidden bg-[#1e1e1e] border border-white/10 shadow-lg font-sans">
                  <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/10">
                    <div className="flex items-center gap-2 text-xs text-white/70 font-mono uppercase tracking-wider">
                      {getLanguageIcon(language)}
                      <span>{language}</span>
                    </div>
                    <CopyButton text={String(children).replace(/\n$/, '')} />
                  </div>
                  <SyntaxHighlighter
                    {...props}
                    style={vscDarkPlus}
                    language={language}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      background: 'transparent',
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              );
            }
            return (
              <code className="bg-black/10 dark:bg-white/10 rounded-md px-1.5 py-0.5 font-mono text-[0.9em]" {...props}>
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>;
          },
          a({ href, children }) {
            return <a href={href} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">{children}</a>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-6 mb-4 space-y-1.5 marker:text-current/50">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-6 mb-4 space-y-1.5 marker:text-current/50">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-4 mt-6 tracking-tight">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-3 mt-5 tracking-tight">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-bold mb-3 mt-4 tracking-tight">{children}</h3>;
          },
          blockquote({ children }) {
            return <blockquote className="border-l-4 border-primary/50 pl-4 italic my-4 text-current/80 bg-primary/5 py-2 pr-4 rounded-r-lg">{children}</blockquote>;
          },
          table({ children }) {
            return <div className="overflow-x-auto mb-4 rounded-lg border border-current/10"><table className="min-w-full border-collapse text-sm">{children}</table></div>;
          },
          th({ children }) {
            return <th className="border-b border-current/10 px-4 py-3 bg-current/5 font-semibold text-left">{children}</th>;
          },
          td({ children }) {
            return <td className="border-b border-current/5 px-4 py-3">{children}</td>;
          },
          input({ type, checked, disabled }) {
            if (type === 'checkbox') {
              return <input type="checkbox" checked={checked} disabled={disabled} className="mr-2 rounded border-current/20 text-primary focus:ring-primary" />;
            }
            return <input type={type} disabled={disabled} />;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
