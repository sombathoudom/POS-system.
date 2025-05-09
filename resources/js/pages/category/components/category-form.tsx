import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Category {
    category_id: number;
    category_name: string;
}

export interface CategoryFormData {
    category_id?: number;
    category_name: string;
    [key: string]: string | number | undefined;
}

export default function categoryForm({
    formData,
    setFormData,
    onSubmit,
    isEditing,
    errors,
    isProcessing,
}: {
    formData: CategoryFormData;
    setFormData: (key: keyof CategoryFormData, value: string | number | undefined) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    isEditing: boolean;
    errors: Partial<Record<keyof CategoryFormData, string>>;
    isProcessing: boolean;
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <Label htmlFor="category_name">Name</Label>
                <Input
                    id="category_name"
                    type="text"
                    value={formData.category_name}
                    onChange={(e) => setFormData('category_name', e.target.value)}
                    className={errors.category_name ? 'border-red-500' : ''}
                />
                {errors.category_name && <p className="mt-1 text-sm text-red-500">{errors.category_name}</p>}
            </div>
            <Button type="submit" disabled={isProcessing}>
                {isProcessing ? 'Processing...' : isEditing ? 'Update' : 'Create'}
            </Button>
        </form>
    );
}
