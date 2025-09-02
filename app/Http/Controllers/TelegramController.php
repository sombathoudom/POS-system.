<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Telegram\Bot\Api;
use App\Models\Expense; // your Expense model

class TelegramController extends Controller
{
    public function webhook(Request $request)
    {
        $telegram = new Api(env('TELEGRAM_BOT_TOKEN'));

        $update = $telegram->getWebhookUpdate();
        $message = $update->getMessage();

        if (!$message) {
            return response()->json(['status' => 'no message']);
        }

        $chatId = $message->getChat()->getId();
        $text = trim($message->getText());

        try {
            // Expected format: "YYYY-MM-DD Name Category Amount"
            $parts = explode(" ", $text, 4);

            if (count($parts) < 4) {
                $telegram->sendMessage([
                    'chat_id' => $chatId,
                    'text' => "❌ Invalid format. Use:\n\nYYYY-MM-DD Name Category Amount\n\nExample: 2025-09-02 Lunch Food 250"
                ]);
                return;
            }

            [$date, $name, $category, $amount] = $parts;


        $category = ExpenseCategory::where('name', 'like', '%' . $category . '%')->first();

        if (!$category) {
            $telegram->sendMessage([
                'chat_id' => $chatId,
                'text' => "❌ Category '{$categoryName}' not found!"
            ]);
            return;
        }

            $expense = Expense::create([
                'expense_date'      => $date,
                'name'             => $name,
                'expense_category_id'  => $category->id,
                'amount'           => (float) $amount,
            ]);

            $telegram->sendMessage([
                'chat_id' => $chatId,
                'text' => "✅ Expense created!\n\n📅 Date: {$expense->expenseDate}\n📝 Name: {$expense->name}\n📂 Category: {$expense->expenseCategory}\n💰 Amount: {$expense->amount}"
            ]);

        } catch (\Exception $e) {
            $telegram->sendMessage([
                'chat_id' => $chatId,
                'text' => "❌ Error: " . $e->getMessage()
            ]);
        }

        return response()->json(['status' => 'ok']);
    }
}
