<?php

namespace App\Http\Controllers;


use Telegram\Bot\Api;
use App\Models\UserState;
use Illuminate\Http\Request;
use App\Models\ExpenseCategory;
use Telegram\Bot\Keyboard\Keyboard;
use App\Models\Expense; // your Expense model
use Illuminate\Support\Facades\Log;

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

        // $chatId = $message->getChat()->getId();
        $chatId = "457402274";
        $text   = trim($message->getText());

        // Get user state
        $userState = UserState::firstOrCreate(['chat_id' => $chatId]);

        // $reply_markup = Keyboard::make()
        //     ->setResizeKeyboard(true)
        //     ->setOneTimeKeyboard(true)
        //     ->row([
        //         Keyboard::button('Create Expense'),
        //         Keyboard::button('Check Boosting'),
        //     ]);

        // $response = $telegram->sendMessage([
        //     'chat_id' =>  $chatId,
        //     'text' => 'Please select an option:',
        //     'reply_markup' => $reply_markup
        // ]);

        if ($text === 'Create Expense') {
            $telegram->sendMessage([
                'chat_id' => $chatId,
                'text' => 'Please enter the expense date (YYYY-MM-DD), name, category, amount (YYYY-MM-DD, Name, Category, Amount):',
            ]);

            $userState->update([
                'state' => 'awaiting_expense_details',
                'temp_data' => [],
            ]);

            return response()->json(['status' => 'ok']);
        }
        switch ($userState->state) {
            case 'awaiting_expense_details':
                // Split user input by comma
                $parts = array_map('trim', explode(',', $text));

                if (count($parts) !== 4) {
                    $telegram->sendMessage([
                        'chat_id' => $chatId,
                        'text' => "❌ Invalid format. Please use:\n`YYYY-MM-DD, Name, Category, Amount`",
                        'parse_mode' => 'Markdown',
                    ]);
                    return response()->json(['status' => 'invalid format']);
                }

                [$date, $name, $categoryName, $amount] = $parts;

                // Check category exists
                $category = ExpenseCategory::where('name', 'like', '%' . $categoryName . '%')->first();

                if (!$category) {
                    $telegram->sendMessage([
                        'chat_id' => $chatId,
                        'text' => "❌ Category '{$categoryName}' not found!",
                    ]);
                    return response()->json(['status' => 'category not found']);
                }

                // Save expense
                Expense::create([
                    #'chat_id'              => $chatId,
                    'expense_date'         => $date,
                    'name'                 => $name,
                    'expense_category_id'  => $category->id,
                    'amount'               => $amount,
                ]);

                // Confirmation message
                $telegram->sendMessage([
                    'chat_id' => $chatId,
                    'text' => "✅ Expense saved:\n\nDate: $date\nName: $name\nCategory: {$category->name}\nAmount: $amount",
                ]);

                // Reset state
                $userState->update([
                    'state' => null,
                    'temp_data' => [],
                ]);
                break;

                // Save expense
                Expense::create([
                    'chat_id'      => $chatId,
                    'expense_date' => $temp['expense_date'],
                    'name'         => $temp['name'],
                    'expense_category_id'     => $temp['category'],
                    'amount'       => $temp['amount'],
                ]);

                $telegram->sendMessage([
                    'chat_id' => $chatId,
                    'text' => "✅ Expense saved:\n\nDate: {$temp['expense_date']}\nName: {$temp['name']}\nCategory: {$temp['category']}\nAmount: {$temp['amount']}",
                ]);

                // Reset state
                $userState->update([
                    'state' => null,
                    'temp_data' => [],
                ]);
                break;

            default:
                // Show default menu
                $reply_markup = Keyboard::make()
                    ->setResizeKeyboard(true)
                    ->setOneTimeKeyboard(true)
                    ->row([
                        Keyboard::button('Create Expense'),
                        Keyboard::button('Check Boosting'),
                    ]);

                $telegram->sendMessage([
                    'chat_id' => $chatId,
                    'text' => 'Choose an option:',
                    'reply_markup' => $reply_markup,
                ]);
        }

        return response()->json(['status' => 'ok']);





        // try {
        //     // Format: "YYYY-MM-DD Name Category Amount"
        //     $parts = explode(" ", $text, 4);

        //     if (count($parts) < 4) {
        //         $telegram->sendMessage([
        //             'chat_id' => $chatId,
        //             'text' => "❌ Invalid format. Use:\n\nYYYY-MM-DD Name Category Amount\n\nExample: 2025-09-02 Lunch Food 250"
        //         ]);
        //         return;
        //     }

        //     [$date, $name, $categoryName, $amount] = $parts;

        //     $category = ExpenseCategory::where('name', 'like', '%' . $categoryName . '%')->first();

        //     if (!$category) {
        //         $telegram->sendMessage([
        //             'chat_id' => $chatId,
        //             'text' => "❌ Category '{$categoryName}' not found!"
        //         ]);
        //         return;
        //     }

        //     $expense = Expense::create([
        //         'expense_date'        => $date,
        //         'name'                => $name,
        //         'expense_category_id' => $category->id,
        //         'amount'              => (float) $amount,
        //     ]);

        //     $telegram->sendMessage([
        //         'chat_id' => $chatId,
        //         'text' => "✅ Expense created!\n\n📅 Date: {$expense->expense_date}\n📝 Name: {$expense->name}\n📂 Category: {$category->name}\n💰 Amount: {$expense->amount}"
        //     ]);
        // } catch (\Exception $e) {
        //     $telegram->sendMessage([
        //         'chat_id' => $chatId,
        //         'text' => "❌ Error: " . $e->getMessage()
        //     ]);
        // }

        // return response()->json(['status' => 'ok']);
    }

    public function handle(Request $request)
    {
        Log::info('Telegram Webhook Payload:', $request->all());

        // Add bot logic here

        return response()->json(['status' => 'ok']);
    }
}
