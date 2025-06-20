'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPrintableReceipt } from '@/services/receipt';

const PRINT_STYLES = `
  .receipt-logo {
    display: block;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
  }
  @media print {
    body {
      margin: 0;
      padding: 0;
    }
    .receipt-logo {
      display: block;
      margin-left: auto;
      margin-right: auto;
      text-align: center;
    }
  }
`;

export default function PrintableReceiptPage() {
  const params = useParams();
  const id = params?.id;
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    if (!id) return;

    async function fetchHtml() {
      try {
        const html = await getPrintableReceipt(Number(id));
        // Inject style at the top
        setHtmlContent(
          `<style>${PRINT_STYLES}</style>` + html
        );
      } catch (err) {
        console.error('Failed to load receipt:', err);
      }
    }

    fetchHtml();
  }, [id]);

  // Print only after content is rendered
  useEffect(() => {
    if (htmlContent) {
      setTimeout(() => window.print(), 100);
    }
  }, [htmlContent]);

  if (!htmlContent) {
    return <p>Loading printable receipt...</p>;
  }

  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}
