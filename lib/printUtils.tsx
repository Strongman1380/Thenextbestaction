import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ReactMarkdown from 'react-markdown';

interface PrintOptions {
  title: string;
  subtitle?: string;
  content: string; // Markdown content
  metadata?: Record<string, string>;
  type: 'case-plan' | 'resource' | 'generic';
  audience?: 'caseworker' | 'client';
}

export const printDocument = (options: PrintOptions) => {
  const { title, subtitle, content, metadata, type } = options;
  const audience = options.audience || 'caseworker';

  const theme = (() => {
    if (type === 'case-plan') {
      return {
        primary: '#1d4ed8',
        primaryStrong: '#e0e7ff',
        border: '#dbeafe',
        bg: '#eef2ff',
        card: '#f8fafc',
        ink: '#0f172a',
      };
    }

    if (audience === 'client') {
      return {
        primary: '#0f766e',
        primaryStrong: '#d1fae5',
        border: '#99f6e4',
        bg: '#ecfeff',
        card: '#f5fffb',
        ink: '#0f172a',
      };
    }

    return {
      primary: '#7c3aed',
      primaryStrong: '#ede9fe',
      border: '#ddd6fe',
      bg: '#f5f3ff',
      card: '#faf5ff',
      ink: '#0f172a',
    };
  })();

  const badgeLabel =
    type === 'case-plan'
      ? 'Case management report'
      : type === 'resource'
        ? audience === 'client'
          ? 'Client handout'
          : 'Caseworker resource'
        : 'Printable summary';

  const audienceLabel = audience === 'client' ? 'Client-friendly format' : 'Caseworker-ready format';
  const helperText = type === 'case-plan'
    ? 'Structured for quick review, printing, and case note entry.'
    : audience === 'client'
      ? 'Plain-language layout for clients; easy to print or share by text.'
      : 'Clear bullets and spacing so workers can print or review at a glance.';
  const footerNote = audience === 'client'
    ? 'Share with the client as appropriate; follow up after they review.'
    : 'Confidential - For professional use only';

  const markdownComponents = {
    h1: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className="mk-h1" {...props} />
    ),
    h2: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 className="mk-h2" {...props} />
    ),
    h3: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h3 className="mk-h3" {...props} />
    ),
    h4: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h4 className="mk-h4" {...props} />
    ),
    p: ({ ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className="mk-p" {...props} />
    ),
    ul: ({ ...props }: React.HTMLAttributes<HTMLUListElement>) => (
      <ul className="mk-list" {...props} />
    ),
    ol: ({ ...props }: React.HTMLAttributes<HTMLOListElement>) => (
      <ol className="mk-ol" {...props} />
    ),
    li: ({ children, node, ...props }: React.HTMLAttributes<HTMLLIElement> & { node?: any }) => {
      const isOrdered = node?.parentNode?.tagName === 'ol' || node?.parent?.tagName === 'ol';
      return (
        <li className="mk-li" {...props}>
          {!isOrdered && <span className="mk-li-marker" aria-hidden="true"></span>}
          <div className="mk-li-content">{children}</div>
        </li>
      );
    },
    blockquote: ({ ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
      <blockquote className="mk-quote" {...props} />
    ),
    strong: ({ ...props }: React.HTMLAttributes<HTMLElement>) => (
      <strong className="mk-strong" {...props} />
    ),
    a: ({ ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a className="mk-link" {...props} />
    ),
  };

  // Convert Markdown to HTML
  const contentHtml = ReactDOMServer.renderToStaticMarkup(
    <div className="markdown-content">
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  );

  const printWindow = window.open('', '', 'height=800,width=1000');
  if (!printWindow) {
    alert('Please allow popups to print this document.');
    return;
  }

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Merriweather:wght@300;400;700&display=swap');

    :root {
      --primary: ${theme.primary};
      --primary-strong: ${theme.primaryStrong};
      --border: ${theme.border};
      --bg: ${theme.bg};
      --card: ${theme.card};
      --ink: ${theme.ink};
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', sans-serif;
      line-height: 1.65;
      color: var(--ink);
      margin: 0;
      padding: 32px;
      background: #f8fafc;
    }

    .page-container {
      max-width: 880px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 18px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
      padding: 28px 30px 36px;
    }

    .label-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 11px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      font-weight: 700;
    }

    .pill-strong {
      background: var(--primary-strong);
      color: #0b1324;
      border: 1px solid var(--primary);
    }

    .pill-soft {
      background: #f8fafc;
      color: #334155;
      border: 1px dashed var(--border);
    }

    .header {
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .brand {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: #6b7280;
      margin-bottom: 8px;
      font-weight: 700;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      line-height: 1.2;
    }

    .subtitle {
      font-size: 16px;
      color: #475569;
      margin-top: 8px;
      line-height: 1.5;
    }

    .helper-note {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px 12px;
      font-size: 13px;
      color: #334155;
      margin-bottom: 18px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 14px;
      background: #f8fafc;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 24px;
      border: 1px solid #e5e7eb;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .meta-label {
      font-size: 11px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #6b7280;
    }

    .meta-value {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }

    .content {
      font-size: 15px;
    }

    .markdown-content {
      display: grid;
      gap: 14px;
    }

    .mk-h1 {
      font-size: 22px;
      margin: 0 0 6px;
      color: #0f172a;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
    }

    .mk-h2 {
      font-size: 19px;
      margin: 26px 0 12px;
      padding: 10px 12px;
      background: var(--bg);
      border-left: 4px solid var(--primary);
      border-radius: 12px;
      color: #0f172a;
    }

    .mk-h3 {
      font-size: 17px;
      margin: 16px 0 8px;
      color: #0f172a;
      font-weight: 700;
    }

    .mk-h4 {
      font-size: 15px;
      margin: 10px 0 6px;
      color: #0f172a;
      font-weight: 700;
    }

    .mk-p {
      margin: 0 0 14px;
      color: #1f2937;
      line-height: 1.7;
    }

    .mk-list {
      list-style: none;
      padding: 0;
      margin: 0 0 8px;
      display: grid;
      gap: 10px;
    }

    .mk-ol {
      list-style: none;
      padding: 0;
      margin: 0 0 8px;
      display: grid;
      gap: 10px;
      counter-reset: item;
    }

    .mk-ol > li {
      counter-increment: item;
      position: relative;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px 12px 10px 42px;
      line-height: 1.6;
    }

    .mk-ol > li::before {
      content: counter(item) ".";
      position: absolute;
      left: 14px;
      top: 12px;
      color: var(--primary);
      font-weight: 700;
    }

    .mk-li {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px 12px;
      line-height: 1.6;
    }

    .mk-li-marker {
      width: 12px;
      height: 12px;
      border-radius: 6px;
      border: 2px solid var(--primary);
      margin-top: 6px;
      background: #ffffff;
      box-shadow: inset 0 0 0 2px #ffffff;
      flex-shrink: 0;
    }

    .mk-li-content {
      flex: 1;
    }

    .mk-quote {
      border-left: 4px solid var(--primary);
      padding: 10px 14px;
      margin: 6px 0 14px;
      background: var(--bg);
      border-radius: 12px;
      color: #334155;
      font-style: italic;
    }

    .mk-strong {
      font-weight: 700;
      color: #0f172a;
    }

    .mk-link {
      color: var(--primary);
      text-decoration: underline;
    }

    .content ul ul,
    .content ol ul,
    .content ul ol {
      margin-top: 6px;
    }

    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      font-size: 10px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }

    @media print {
      body {
        padding: 0;
        background: white;
      }
      .page-container {
        width: 100%;
        max-width: none;
        box-shadow: none;
        border: none;
      }
      @page {
        margin: 1.5cm;
      }
    }
  `;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="page-container">
          <div class="label-row">
            <span class="pill pill-strong">${badgeLabel}</span>
            <span class="pill pill-soft">${audienceLabel}</span>
          </div>
          <div class="header">
            <div>
              <div class="brand">The Next Best Action</div>
              <h1>${title}</h1>
              ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}
            </div>
            <div style="text-align: right;">
              <div class="brand">Generated</div>
              <div style="font-family: 'Inter', sans-serif; font-weight: 600;">${date}</div>
            </div>
          </div>
          <div class="helper-note">${helperText}</div>

          ${metadata ? `
            <div class="meta-grid">
              ${Object.entries(metadata).map(([key, value]) => `
                <div class="meta-item">
                  <span class="meta-label">${key}</span>
                  <span class="meta-value">${value}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="content">
            ${contentHtml}
          </div>

          <div class="footer">
            <span>${footerNote}</span>
            <span>The Next Best Action</span>
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  
  // Wait for fonts to load before printing
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 500);
};
