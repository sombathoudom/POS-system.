import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Expense } from './index';

interface ExpenseCategory {
    id: number;
    name: string;
}

interface FormExpenseProps {
    expenseCategories: ExpenseCategory[];
    expense?: Expense;
}

export default function FormExpense({ expenseCategories, expense }: FormExpenseProps) {
    const [isDisabled, setIsDisabled] = useState(false);
    const { data, setData, post, errors, put } = useForm({
        expense_date: expense?.expense_date || new Date().toISOString().split('T')[0],
        name: expense?.name || '',
        amount: expense?.amount || '',
        description: expense?.description || '',
        expense_category_id: expense?.expense_category_id || '',
    });
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsDisabled(true);
        if (expense) {
            put(route('expsense.update', { id: expense.id }), {
                onSuccess: () => {
                    setIsDisabled(false);
                },
                onError: () => {
                    setIsDisabled(false);
                },
            });
        } else {
            post(route('expsense.store'), {
                onError: () => {
                    setIsDisabled(false);
                },
            });
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Expense</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-1">
                                    <Label>Expense Date</Label>
                                    <Input
                                        type="date"
                                        name="expense_date"
                                        value={data.expense_date}
                                        onChange={(e) => setData('expense_date', e.target.value)}
                                    />
                                    <InputError message={errors.expense_date} />
                                </div>
                                <div className="col-span-1">
                                    <Label>Expense Name</Label>
                                    <Input type="text" name="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="col-span-1">
                                    <Label>Expense Category</Label>
                                    <Select
                                        name="expense_category_id"
                                        value={data.expense_category_id.toString()}
                                        onValueChange={(value) => setData('expense_category_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Expense Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {expenseCategories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.expense_category_id} />
                                </div>
                                <div className="col-span-1">
                                    <Label>Expense Amount</Label>
                                    <Input type="number" name="amount" value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                                    <InputError message={errors.amount} />
                                </div>
                                <div className="col-span-2">
                                    <Label>Expense Description</Label>
                                    <Textarea name="description" />
                                </div>
                            </div>
                            <Button type="submit" disabled={isDisabled}>
                                {isDisabled ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
