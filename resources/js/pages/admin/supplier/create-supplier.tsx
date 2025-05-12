import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

export default function CreateSupplier() {
    const { data, setData, post, processing, errors, wasSuccessful } = useForm({
        supplier_name: '',
        contact_info: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('suppliers.store'), {
            onError: () => {
                toast.error('Failed to create supplier');
            },
        });
    };

    return (
        <AppLayout>
            <div className="space-y-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Supplier</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4">
                                <Label>Name</Label>
                                <Input type="text" name="name" onChange={(e) => setData('supplier_name', e.target.value)} />
                                <InputError message={errors.supplier_name} />
                                <Label>Contact Info</Label>
                                <Textarea name="contact_info" onChange={(e) => setData('contact_info', e.target.value)} />
                                <InputError message={errors.contact_info} />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">Create</Button>
                                <Button type="reset" variant={'secondary'}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
