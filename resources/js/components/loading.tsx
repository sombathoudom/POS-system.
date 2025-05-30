import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin" size={40} />
            <p className="text-2xl font-bold">Loading...</p>
        </div>
    );
}
