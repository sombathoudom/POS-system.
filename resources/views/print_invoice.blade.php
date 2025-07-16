<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
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
          .font-bold { font-weight: 900 !important; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .text-left { text-align: left; }
        }
      </style>
</head>
<body>
    <div id="invoice-content" ref={invoiceContentRef}>
        <div className="mx-auto max-w-md space-y-4">
            <div>
                <p className="text-md text-left font-semibold">Doly Outfit</p>
                <p className="text-left text-xs">អ្នកផ្ញើ: 066470215</p>
            </div>
            <div className="space-y-1">
                <p className="text-left text-xs font-bold">ថ្ងៃចេញវិក័យបត្រ:  {{ format_date($saleTransaction->transaction_date) }}</p>
                <p className="text-left text-xs font-bold">ឈ្មោះអតិថិជន: {{ $saleTransaction->customer->name }}</p>
                <p className="text-left text-xs font-bold">លេខទូរស័ព្ទ: {{ $saleTransaction->customer->phone }}</p>
                <p className="text-left text-xs font-bold">អាស័យដ្ឋាន: {{ $saleTransaction->customer->address }}</p>

                <p className="text-left text-xs font-bold">
                    សេវាដឹក: {{ $saleTransaction->delivery_fee }} | តម្លៃសរុប: {{format_currency($saleTransaction->total_amount_usd)}} |
                    {{format_currency($saleTransaction->total_amount_khr,'KHR') }}
                </p>
                <p className="text-left text-xs font-bold">ស្ថានភាព: {{ $saleTransaction->status === 'paid' ? 'បានបង់ប្រាក់' : 'មិនបានបង់ប្រាក់' }}</p>
                <p className="text-left text-xs font-bold">Ref: {{ $saleTransaction->invoice_number }}</p>
            </div>
        </div>
    </div>
    <script>
      window.onload = function() {
            window.print();
            // Attempt to close the print dialog after a short delay
            setTimeout(() => {
                window.close();
            }, 500);
        };
    </script>
</body>
</html>

