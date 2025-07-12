<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\Request;
use App\Models\PurchaseOrder;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\PurchaseOrderResource;

class PurchaseController extends Controller
{
    public function index()
    {

        $purchaseOrders = PurchaseOrder::with('supplier')->latest()->paginate(10);
        $purchaseOrders = PurchaseOrderResource::collection($purchaseOrders);
        return Inertia::render('admin/purchase/purchase-order', [
            'purchaseOrders' => $purchaseOrders,
        ]);
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
        try {
            $request->validate([
                'supplier_id' => 'required',
                'order_date' => 'required',
                'status' => 'required',
                'total_amount' => 'required',
                'items' => 'required',
            ]);



            DB::beginTransaction();

            $purchaseOrder = PurchaseOrder::create([
                'supplier_id' => intval($request->supplier_id),
                'order_date' => $request->order_date ?? now(),
                'status' => $request->status,
                'total_amount' => $request->total_amount,
            ]);

            foreach ($request->items as $item) {
                if ($item['unit_price'] == 0) {
                    $item['unit_price'] = $item['cost_price_usd'];
                }
                if ($item['type'] == 'single') {
                    $product = Product::find($item['product_id']);
                    $product->quantity += $item['quantity'];
                    $product->save();

                    $purchaseOrder->items()->create([
                        'product_id' => $item['product_id'],
                        'variant_id' => null,
                        'quantity' =>  $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'subtotal' => $item['quantity'] * $item['unit_price'],
                    ]);
                } else {
                    $variant = ProductVariant::find($item['variant_id']);
                    $variant->quantity += $item['quantity'];
                    $variant->save();

                    $purchaseOrder->items()->create([
                        'product_id' => $item['product_id'],
                        'variant_id' => $variant['variant_id'],
                        'quantity' =>  $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'subtotal' => $item['quantity'] * $item['unit_price'],
                    ]);
                }
            }
            DB::commit();
            return to_route('purchase.index')->with('success', 'Purchase order created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return to_route('purchase.index')->with('error', 'Purchase order creation failed');
        }
    }

    public function show($id)
    {
        $purchaseOrder = PurchaseOrder::with(['supplier', 'items', 'items.product', 'items.variant'])->latest()->find($id);

        $purchaseOrder = PurchaseOrderResource::make($purchaseOrder);
        return Inertia::render('admin/purchase/purchase-detail', [
            'purchaseOrder' => $purchaseOrder,
        ]);
    }
}
