import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { formatCurrency, formatCurrencyKHR } from "@/lib/utils"
import { type Customer, type CartItem } from "@/pages/admin/pos/pos"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter, TableCaption} from "@/components/ui/table"
import { Badge } from "./badge"
interface ConfirmOrderProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    onCancel: () => void;
    customer: Customer;
    total: number;
    discount: number;
    deliveryFee: number;
    totalKhr: number;
    status: string;
    cart: CartItem[];
}

export function ConfirmOrder({ open, onConfirm, onCancel, customer, total, discount, deliveryFee, totalKhr, status, cart }: ConfirmOrderProps) {
  return (
      <Dialog open={open} onOpenChange={onCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>សូមមេត្តាពិនិត្យមើលផងមុនបង្កើតវិក័យបត្រ🙏</DialogTitle>
            <DialogDescription>
              កុំអោយខុសទៀតអីសុំអង្វរមែនតាស🙏
            </DialogDescription>
          </DialogHeader>
        <div className="grid gap-4">
                <div className="grid gap-3">
                <Label className="text-lg font-bold">ពត័មានវិក័យបត្រ</Label>
                <Badge variant={status === 'paid' ? 'success' : 'destructive'} className="leading-7 text-xl">{status === 'paid' ? 'បានបង់ប្រាក់' : 'មិនបានបង់ប្រាក់'}</Badge>
                <Label className="text-lg font-bold">ពត័មានអតិថិជន</Label>
                <Badge variant="destructive" className="leading-7 text-xl">{customer.name} | {customer.phone} | {customer.address} </Badge>
                <Table>
                    <TableHeader>
                        <TableRow>
                                <TableHead>ផលិតផល</TableHead>
                                <TableHead>ចំនួន</TableHead>
                                <TableHead>តម្លៃ</TableHead>
                                <TableHead>សរុប</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cart.map((product) => (
                            <TableRow key={product.id}>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.quantity}</TableCell>
                                    <TableCell>{formatCurrency(product.price)}</TableCell>
                                    <TableCell>{formatCurrency(product.price * product.quantity)}</TableCell>
                            </TableRow>
                            ))}

                          </TableBody>
                          <TableFooter>
                            <TableRow>
                                <TableCell>បញ្ចុះតម្លៃ</TableCell>
                                <TableCell  colSpan={3} className="text-right">{formatCurrency(discount)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>តម្លៃដឹក</TableCell>
                                <TableCell colSpan={3} className="text-right">{formatCurrency(deliveryFee)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>តម្លៃសរុប(KHR)</TableCell>
                                <TableCell colSpan={3} className="text-right">{formatCurrencyKHR(totalKhr)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>តម្លៃសរុប(USD)</TableCell>
                                <TableCell colSpan={3} className="text-right">{formatCurrency(total)}</TableCell>
                            </TableRow>
                          </TableFooter>
                </Table>
            </div>
        </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="destructive" onClick={onCancel}>បោះបង់</Button>
            </DialogClose>
            <Button onClick={onConfirm}>ចាសពិតជាត្រូវហើយ</Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}
