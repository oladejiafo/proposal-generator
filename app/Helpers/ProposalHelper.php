<?php

namespace App\Helpers;

use App\Models\Proposal;

class ProposalHelper
{
    public static function fillTemplate($templateContent, Proposal $proposal)
    {
       // Generate line items HTML
        $lineItemsHtml = '';
        
        if (!empty($proposal->line_items)) {
            $lineItemsHtml .= '<table style="width:100%; border-collapse: collapse; margin: 0; font-family: Arial, sans-serif; line-height:1.2;">';
            
            $lineItemsHtml .= '<thead>
                <tr style="background-color: #f8f9fa;">
                    <th style="text-align:left; padding: 4px; border-bottom:1px solid #ccc;">Description</th>
                    <th style="text-align:center; padding:4px; border-bottom:1px solid #ccc;">Qty</th>
                    <th style="text-align:right; padding:4px; border-bottom:1px solid #ccc;">Price</th>
                    <th style="text-align:right; padding:4px; border-bottom:1px solid #ccc;">Total</th>
                </tr>
            </thead><tbody>';

            foreach ($proposal->line_items as $item) {
                $itemTotal = $item['quantity'] * $item['price'];
                $lineItemsHtml .= "<tr>
                    <td style='padding:4px; border-bottom:1px solid #eee;'>{$item['description']}</td>
                    <td style='padding:4px; text-align:center; border-bottom:1px solid #eee;'>{$item['quantity']}</td>
                    <td style='padding:4px; text-align:right; border-bottom:1px solid #eee;'>{$item['price']}</td>
                    <td style='padding:4px; text-align:right; border-bottom:1px solid #eee;'>{$itemTotal}</td>
                </tr>";
            }

            // Total row
            $lineItemsHtml .= "<tr>
                <td colspan='3' style='text-align:right; padding:4px; font-weight:bold; border-top:1px solid #ccc;'>Total:</td>
                <td style='text-align:right; padding:4px; font-weight:bold; border-top:1px solid #ccc;'>{$proposal->pricing}</td>
            </tr>";

            $lineItemsHtml .= '</tbody></table>';
        }

        $companyLine = $proposal->your_company ? ', '. $proposal->your_company : ', Independent Consultant';

        $placeholders = [
            '{{client_name}}' => $proposal->client->name ?? '',
            '{{client_company}}' => $proposal->client->company ?? '',
            '{{project_details}}' => $proposal->project_details ?? '',
            '{{pricing}}' => $proposal->pricing ?? 0,
            '{{your_name}}' => $proposal->your_name ?? '',
            '{{your_position}}' => $proposal->your_position ?? '',
            '{{your_company}}' => $proposal->your_company ?? '',
            '{{your_company_line}}' => $companyLine,
            '{{your_contact_info}}' => $proposal->your_contact_info ?? '',
            '{{line_items}}'        => $lineItemsHtml,
            // '{{line_items}}' => $lineItemsHtml ?: ('$' . number_format($proposal->pricing, 2))
        ];

        return strtr($templateContent, $placeholders);
    }

    public static function generateLineItemsTable(Proposal $proposal)
    {
        if (empty($proposal->line_items)) return '';

        $html = '<table style="width:100%; border-collapse: collapse; margin:0; font-family: Arial, sans-serif; font-size:12px; line-height:1.2;">';
        $html .= '<thead>
            <tr style="background-color:#f8f9fa;">
                <th style="text-align:left; padding:4px; border-bottom:1px solid #ccc;">Description</th>
                <th style="text-align:center; padding:4px; border-bottom:1px solid #ccc;">Qty</th>
                <th style="text-align:right; padding:4px; border-bottom:1px solid #ccc;">Price</th>
                <th style="text-align:right; padding:4px; border-bottom:1px solid #ccc;">Total</th>
            </tr>
        </thead><tbody>';

        foreach ($proposal->line_items as $item) {
            $itemTotal = $item['quantity'] * $item['price'];
            $html .= "<tr>
                <td style='padding:4px; border-bottom:1px solid #eee;'>{$item['description']}</td>
                <td style='padding:4px; text-align:center; border-bottom:1px solid #eee;'>{$item['quantity']}</td>
                <td style='padding:4px; text-align:right; border-bottom:1px solid #eee;'>{$item['price']}</td>
                <td style='padding:4px; text-align:right; border-bottom:1px solid #eee;'>{$itemTotal}</td>
            </tr>";
        }

        // Total row
        $html .= "<tr>
            <td colspan='3' style='text-align:right; padding:4px; font-weight:bold; border-top:1px solid #ccc;'>Total:</td>
            <td style='text-align:right; padding:4px; font-weight:bold; border-top:1px solid #ccc;'>{$proposal->pricing}</td>
        </tr>";

        $html .= '</tbody></table>';

        return $html;
    }
}



