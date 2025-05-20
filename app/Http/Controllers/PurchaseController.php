<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Supplier;
use Illuminate\Http\Request;
use App\Models\PurchaseOrder;

class PurchaseController extends Controller
{
    public function index()
    {

        return Inertia::render('admin/purchase/purchase-order');
    }

    public function create()
    {
        $suppliers = Supplier::select('supplier_id', 'supplier_name')->get();
        return Inertia::render('admin/purchase/form-purchase', [
            'suppliers' => $suppliers,
        ]);
    }

    public function store(Request $request)
    {
        dd($request->all());
        $request->validate([
            'supplier_id' => 'required',
            'order_date' => 'required',
            'status' => 'required',
            'total_amount' => 'required',
            'items' => 'required',
        ]);
        $purchaseOrder = PurchaseOrder::create([
            'supplier_id' => $request->supplier_id,
            'order_date' => $request->order_date ?? now(),
            'status' => $request->status,
            'total_amount' => $request->total_amount,
        ]);
        foreach ($request->items as $item) {
            $purchaseOrder->items()->create([
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
            ]);
        }
    }
}
