import { Badge } from './ui/badge';

export default function TransactionBadgeStatus({ status }: { status: string }) {
    const getBadgeColor = (status: string) => {
        switch (status) {
            case 'unpaid':
                return 'bg-yellow-500 text-white';
            case 'paid':
                return 'bg-green-500 text-white';
            case 'partial_paid':
                return 'bg-blue-500 text-white';
            case 'cancelled':
                return 'bg-red-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };
    return (
        <Badge variant="outline" className={getBadgeColor(status)}>
            {status}
        </Badge>
    );
}
