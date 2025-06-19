'use client';

import React from 'react'; // ✅ Needed for JSX rendering
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPrintableReceipt } from '@/services/receipt';

export default function PrintableReceiptPage() {
  const params = useParams();
  const id = params?.id;
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    if (!id) return;

    async function fetchHtml() {
      try {
        const html = await getPrintableReceipt(Number(id));
        setHtmlContent(html);

        setTimeout(() => window.print(), 200);
      } catch (err) {
        console.error('Failed to load receipt:', err);
      }
    }

    fetchHtml();
  }, [id]);

  if (!htmlContent) {
    return <p>Loading printable receipt...</p>;
  }

  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
}
