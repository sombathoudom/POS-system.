import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Invoice } from '@/pages/admin/pos/pos';
import { Printer } from 'lucide-react';
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

const InvoiceModal = ({ invoice }: { invoice: Invoice }) => {
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
          }
          .invoice-container {
            max-width: 80mm;
            margin: 0 auto;
            color: #000;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;

          }
          th, td {
            padding: 5px;
            text-align: center;
          }
          .text-sm { font-size: 12px; }
          .text-lg { font-size: 14px; }
          .text-xl { font-size: 16px; }
          .font-bold { font-weight: bold; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .border-t { border-top: 1px solid #000; }
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
        <Dialog open={true}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invoice #{invoice?.invoice_number || 'N/A'}</DialogTitle>
                </DialogHeader>

                <div id="invoice-content" ref={invoiceContentRef}>
                    <div className="mx-auto max-w-md space-y-4">
                        <h1 className="text-center text-xl font-bold">Shop Name</h1>

                        {/* <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <p>លេខវិក័យបត្រ: {invoice?.invoice_number || 'N/A'}</p>
                            <p className="text-right">
                                ថ្ងៃចេញវិក័យបត្រ: {invoice?.transaction_date ? new Date(invoice.transaction_date).toLocaleDateString() : 'N/A'}
                            </p>
                            <p>ឈ្មោះអតិថិជន: {invoice?.customer?.name || 'N/A'}</p>
                            <p className="text-right">លេខទូរស័ព្ទ: {invoice?.customer?.phone || 'N/A'}</p>
                        </div> */}
                        <table className="w-full border-separate border-spacing-2">
                            <tbody>
                                <tr>
                                    <td className="text-left text-xs">លេខវិក័យបត្រ</td>
                                    <td className="text-left text-xs">{invoice?.invoice_number || 'N/A'}</td>
                                    <td className="text-left text-xs">ថ្ងៃចេញវិក័យបត្រ</td>
                                    <td className="text-left text-xs">
                                        {invoice?.transaction_date ? new Date(invoice.transaction_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="text-left text-xs">ឈ្មោះអតិថិជន</td>
                                    <td className="text-left text-xs">{invoice?.customer?.name || 'N/A'}</td>
                                    <td className="text-left text-xs">លេខទូរស័ព្ទ</td>
                                    <td className="text-left text-xs">{invoice?.customer?.phone || 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>

                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 text-left text-xs">ឈ្មោះ</th>
                                    <th className="p-2 text-xs">ចំនួន</th>
                                    <th className="p-2 text-xs">សរុប</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs text-gray-600">
                                {invoice?.products?.length > 0 ? (
                                    invoice.products.map((item) => (
                                        <tr key={item.key}>
                                            <td className="p-2">{item.name}</td>
                                            <td className="p-2 text-center">{item.quantity}</td>
                                            <td className="p-2 text-center">{formatCurrency(item.price * (item?.quantity ?? 0))}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="p-2 text-center">
                                            No items found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="text-sm text-gray-600">
                                <tr>
                                    <td colSpan={2} className="p-2 text-right font-bold">
                                        Delivery Fee:
                                    </td>
                                    <td className="p-2 text-center">{formatCurrency(invoice.delivery_fee)}</td>
                                </tr>
                                <tr>
                                    <td colSpan={2} className="p-2 text-right font-bold">
                                        Total:
                                    </td>
                                    <td className="p-2 text-center">{formatCurrency(invoice.total_amount_usd)}</td>
                                </tr>
                                <tr>
                                    <td colSpan={2} className="p-2 text-right font-bold">
                                        Total KHR:
                                    </td>
                                    <td className="p-2 text-center">{formatCurrency(invoice.total_amount_khr, 'KHR')}</td>
                                </tr>
                            </tfoot>
                        </table>
                        <p className="text-center text-sm text-gray-600">Thank you for your business!</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={printInvoice}>
                        <Printer className="mr-2 h-5 w-5" />
                        Print Invoice
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default InvoiceModal;
