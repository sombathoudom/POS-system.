import { Button } from '@/components/ui/button'; // Adjust path based on your UI library
import { Fragment } from 'react';

interface SaleTransaction {
    status: 'unpaid' | 'paid' | 'cancelled' | string; // Allow string for flexibility
    transaction_id: string | number;
}

interface TransactionStatusButtonsProps {
    saleTransaction?: SaleTransaction;
    markAsPaid: (id: number) => void;
    markAsCancelled: (id: number) => void;
}

const TransactionStatusButtons = ({ saleTransaction, markAsPaid, markAsCancelled }: TransactionStatusButtonsProps) => {
    if (!saleTransaction || !saleTransaction.status || !saleTransaction.transaction_id) {
        return <p>Loading transaction data...</p>; // Fallback UI
    }

    if (saleTransaction.status === 'paid') {
        return null; // Hide all buttons when status is 'paid'
    }

    return (
        <Fragment>
            {saleTransaction.status === 'unpaid' && (
                <>
                    <Button
                        variant="success" // Adjust variant based on your UI library (e.g., 'success' may not be valid)
                        onClick={() => markAsPaid(Number(saleTransaction.transaction_id))}
                        className="mr-2" // Optional: Add margin between buttons
                    >
                        Mark as Paid
                    </Button>
                    <Button variant="destructive" onClick={() => markAsCancelled(Number(saleTransaction.transaction_id))}>
                        Mark as Cancelled
                    </Button>
                </>
            )}
            {saleTransaction.status !== 'unpaid' && saleTransaction.status !== 'cancelled' && (
                <Button variant="destructive" onClick={() => markAsCancelled(Number(saleTransaction.transaction_id))}>
                    Mark as Cancelled
                </Button>
            )}
        </Fragment>
    );
};

export default TransactionStatusButtons;
