'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getPrintableReceipt } from '@/services/receipt';
export default function PrintableReceiptPage() {
    const params = useParams();
    const id = params === null || params === void 0 ? void 0 : params.id;
    useEffect(() => {
        if (!id)
            return;
        async function printReceipt() {
            try {
                const html = await getPrintableReceipt(Number(id));
                const newWindow = window.open('', '_blank');
                if (newWindow) {
                    newWindow.document.write(html);
                    newWindow.document.close();
                }
                else {
                    alert("Unable to open print window. Please allow pop-ups.");
                }
            }
            catch (err) {
                console.error('Failed to load receipt:', err);
            }
        }
        printReceipt();
    }, [id]);
    return null;
}
