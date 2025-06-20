import { Button } from '@/components/ui/button'; // Adjust path based on your UI library
import { router } from '@inertiajs/react';
import { Fragment } from 'react';

interface SaleTransaction {
    status: 'unpaid' | 'paid' | 'cancelled' | string; // Allow string for flexibility
    transaction_id: string | number;
}

interface TransactionStatusButtonsProps {
    saleTransaction?: SaleTransaction;
}

const TransactionStatusButtons = ({ saleTransaction }: TransactionStatusButtonsProps) => {
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
                        onClick={() =>
                            router.post(
                                route('sale-transaction.markAsPaid', { id: saleTransaction.transaction_id }),
                                { preserveState: true, preserveScroll: true },
                                {
                                    onError: (errors) => {
                                        console.error('Error marking as paid:', errors);
                                        // Optionally show a user-friendly error (e.g., toast notification)
                                    },
                                },
                            )
                        }
                        className="mr-2" // Optional: Add margin between buttons
                    >
                        Mark as Paid
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() =>
                            router.post(
                                route('sale-transaction.markAsCancelled', { id: saleTransaction.transaction_id }),
                                { preserveState: true, preserveScroll: true },
                                {
                                    onError: (errors) => {
                                        console.error('Error marking as cancelled:', errors);
                                        // Optionally show a user-friendly error
                                    },
                                },
                            )
                        }
                    >
                        Mark as Cancelled
                    </Button>
                </>
            )}
            {saleTransaction.status !== 'unpaid' && saleTransaction.status !== 'cancelled' && (
                <Button
                    variant="destructive"
                    onClick={() =>
                        router.post(
                            route('sale-transaction.markAsCancelled', { id: saleTransaction.transaction_id }),
                            {},
                            {
                                onError: (errors) => {
                                    console.error('Error marking as cancelled:', errors);
                                    // Optionally show a user-friendly error
                                },
                            },
                        )
                    }
                >
                    Mark as Cancelled
                </Button>
            )}
        </Fragment>
    );
};

export default TransactionStatusButtons;
