import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Invoice } from '@/pages/admin/pos/pos';
import { Printer, X } from 'lucide-react';
import { useRef } from 'react';
// Utility function for currency formatting
const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(amount);
};

// Utility function to convert USD to KHR
const usdToKhr = (usdAmount: number, exchangeRate = 4100) => {
    return usdAmount * exchangeRate;
};

const InvoiceModal = ({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) => {
    const invoiceContentRef = useRef<HTMLDivElement>(null);
    console.log(invoice);
    // Calculate totals
    const subtotal = invoice?.products?.reduce((sum: number, item: any) => sum + item.total, 0) || 0;
    const total = subtotal; // Add tax or other calculations if needed
    const totalKhr = usdToKhr(total);

    const printInvoice = () => {
        const content = invoiceContentRef.current?.innerHTML;
        if (!content) return;

        const printWindow = window.open('', '', 'height=600,width=800');
        if (!printWindow) return;

        // Create print-specific styles
        const printStyles = `
      <style>
        @media print {
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            font-size: 12px;
            padding: 10px;
          }
          .invoice-container {
            max-width: 80mm;
            margin: 0 auto;
            color: #000;
          }
          p{
            margin: 0;
            padding: 0;
          }
          .text-xs { font-size: 12px; }
          .text-lg { font-size: 14px; }
          .text-xl { font-size: 16px; }
          .font-bold { font-weight: bold; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .text-left { text-align: left; }
        }
      </style>
    `;

        printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${invoice?.invoice_number || 'N/A'}</title>
          ${printStyles}
        </head>
        <body>
          <div class="invoice-container">${content}</div>
        </body>
      </html>
    `);

        printWindow.document.close();
        printWindow.focus();

        // Ensure styles are applied before printing
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invoice #{invoice?.invoice_number || 'N/A'}</DialogTitle>
                </DialogHeader>

                <div id="invoice-content" ref={invoiceContentRef}>
                    <div className="mx-auto max-w-md space-y-4">
                        <div>
                            <p className="text-md text-left font-semibold">Doly Outfit</p>
                            <p className="text-left text-xs">អ្នកផ្ញើ: 066470215</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-left text-xs font-bold">ថ្ងៃចេញវិក័យបត្រ: {invoice?.transaction_date || 'N/A'}</p>
                            <p className="text-left text-xs font-bold">ឈ្មោះអតិថិជន: {invoice?.customer?.name || 'N/A'}</p>
                            <p className="text-left text-xs font-bold">លេខទូរស័ព្ទ: {invoice?.customer?.phone || 'N/A'}</p>
                            <p className="text-left text-xs font-bold">អាស័យដ្ឋាន: {invoice?.customer?.address || 'N/A'}</p>

                            <p className="text-left text-xs font-bold">
                                សេវាដឹក: {formatCurrency(invoice?.delivery_fee)} | តម្លៃសរុប: {formatCurrency(invoice?.total_amount_usd)}|
                                {formatCurrency(invoice?.total_amount_khr, 'KHR')}
                            </p>
                            <p className="text-left text-xs font-bold">ស្ថានភាព: {invoice?.status === 'paid' ? 'បានបង់ប្រាក់' : 'មិនបានបង់ប្រាក់'}</p>
                            <p className="text-left text-xs font-bold">Ref: {invoice?.invoice_number || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={printInvoice}>
                        <Printer className="mr-2 h-5 w-5" />
                        Print Invoice
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                        <X className="mr-2 h-5 w-5" />
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default InvoiceModal;
