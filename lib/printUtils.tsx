import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ReactMarkdown from 'react-markdown';

interface PrintOptions {
  title: string;
  subtitle?: string;
  content: string; // Markdown content
  metadata?: Record<string, string>;
  type: 'case-plan' | 'resource' | 'generic';
}

export const printDocument = (options: PrintOptions) => {
  const { title, subtitle, content, metadata, type } = options;

  // Convert Markdown to HTML
  const contentHtml = ReactDOMServer.renderToStaticMarkup(
    <div className="markdown-content">
      <ReactMarkdown>{content}</ReactMarkdown>
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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Merriweather:wght@300;400;700&display=swap');

    body {
      font-family: 'Merriweather', serif;
      line-height: 1.6;
      color: #1f2937;
      margin: 0;
      padding: 40px;
      background: white;
    }

    .page-container {
      max-width: 800px;
      margin: 0 auto;
    }

    /* Header Section */
    .header {
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .brand {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #6b7280;
      margin-bottom: 8px;
    }

    h1 {
      font-family: 'Inter', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin: 0;
      line-height: 1.2;
    }

    .subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      color: #4b5563;
      margin-top: 8px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      background: #f9fafb;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 30px;
      font-family: 'Inter', sans-serif;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
    }

    .meta-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #6b7280;
      margin-bottom: 4px;
    }

    .meta-value {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
    }

    /* Content Styling */
    .content {
      font-size: 16px;
    }

    .content h1, .content h2, .content h3 {
      font-family: 'Inter', sans-serif;
      color: #111827;
      margin-top: 24px;
      margin-bottom: 12px;
    }

    .content h1 { font-size: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    .content h2 { font-size: 20px; font-weight: 600; }
    .content h3 { font-size: 18px; font-weight: 600; }

    .content p {
      margin-bottom: 16px;
      text-align: justify;
    }

    .content ul, .content ol {
      margin-bottom: 16px;
      padding-left: 24px;
    }

    .content li {
      margin-bottom: 8px;
    }

    .content strong {
      color: #111827;
      font-weight: 700;
    }

    .content blockquote {
      border-left: 4px solid #3b82f6;
      padding-left: 16px;
      margin-left: 0;
      color: #4b5563;
      font-style: italic;
    }

    /* Enhanced Resource Formatting for Print */
    .content ul ul {
      margin-top: 8px;
      margin-bottom: 12px;
      padding-left: 20px;
      list-style-type: none;
    }

    .content ul ul li {
      margin-bottom: 6px;
      line-height: 1.5;
    }

    /* Prevent resource sections from breaking across pages */
    .content > ul > li {
      page-break-inside: avoid;
      margin-bottom: 18px;
      padding-bottom: 8px;
    }

    /* Ensure headings stay with their content */
    .content h2, .content h3 {
      page-break-after: avoid;
      page-break-inside: avoid;
    }

    /* Better spacing for resource lists */
    .content ul li strong:first-child {
      display: block;
      margin-bottom: 4px;
      font-size: 17px;
    }

    /* Footer */
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      color: #9ca3af;
      text-align: center;
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
      }
      @page {
        margin: 2cm;
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
            <span>Confidential - For Professional Use Only</span>
            <span>Page 1</span>
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
