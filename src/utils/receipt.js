/**
 * Open a printable receipt in a new window
 * @param receiptId The ID of the receipt to print
 * @param baseUrl The base URL of the API (optional, defaults to env variable)
 */
export const openPrintableReceipt = (receiptId, baseUrl) => {
    const apiUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const receiptUrl = `${apiUrl}/fees/receipts/${receiptId}/print`;
    // Open in a new window/tab
    window.open(receiptUrl, `receipt_${receiptId}`, 'width=800,height=600');
};
/**
 * Create an iframe to trigger print dialog for a receipt
 * @param receiptId The ID of the receipt to print
 * @param baseUrl The base URL of the API (optional, defaults to env variable)
 */
export const printReceipt = (receiptId, baseUrl) => {
    const apiUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const receiptUrl = `${apiUrl}/fees/receipts/${receiptId}/print`;
    // Create an iframe to load the receipt for printing
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = receiptUrl;
    // Add event listener to trigger print when the iframe loads
    iframe.onload = () => {
        var _a;
        try {
            (_a = iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.print();
            // Remove the iframe after printing (after a delay)
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        }
        catch (error) {
            console.error('Error printing receipt:', error);
            // If printing failed, open in a new window as fallback
            openPrintableReceipt(receiptId, baseUrl);
            document.body.removeChild(iframe);
        }
    };
    // Add iframe to the document to start loading
    document.body.appendChild(iframe);
};
/**
 * Generate a receipt number from a receipt ID
 * @param receiptId The ID of the receipt
 * @returns A formatted receipt number
 */
export const formatReceiptNumber = (receiptId) => {
    return `R-${receiptId.toString().padStart(6, '0')}`;
};
/**
 * Format a date for receipt display
 * @param date The date to format
 * @returns A formatted date string
 */
export const formatReceiptDate = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};
/**
 * Format an amount for receipt display
 * @param amount The amount to format
 * @returns A formatted amount string
 */
export const formatReceiptAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
};
/**
 * Format receipt data for display
 * @param receipt The receipt data
 * @returns Formatted receipt data for display
 */
export const formatReceiptForDisplay = (receipt) => {
    return Object.assign(Object.assign({}, receipt), { formatted_receipt_number: formatReceiptNumber(receipt.id), formatted_date: formatReceiptDate(receipt.date_issued), formatted_amount: formatReceiptAmount(receipt.amount), receipt_type_display: receipt.receipt_type.charAt(0).toUpperCase() + receipt.receipt_type.slice(1) });
};
export default {
    openPrintableReceipt,
    printReceipt,
    formatReceiptNumber,
    formatReceiptDate,
    formatReceiptAmount,
    formatReceiptForDisplay
};
