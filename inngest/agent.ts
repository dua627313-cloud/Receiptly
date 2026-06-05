import { inngest } from "./client";
import Events from "./constants";
import { extractPdfText } from "@/lib/extractPdfText";
import convex from "@/lib/convexClient";
import { api } from "@/convex/_generated/api";

export const extractAndSavePDF = inngest.createFunction(
    { id: "Extract PDF and Save in Database" },
    { event: Events.EXTRACT_DATA_FROM_PDF_AND_SAVE_TO_DATABASE },

    async ({ event }) => {
        console.log("PDF URL:", event.data.url);

        // 1. download pdf
        const res = await fetch(event.data.url);
        const buffer = Buffer.from(await res.arrayBuffer());

        // 2. extract text
        const text = await extractPdfText(buffer);

        console.log("TEXT:", text);

        if (!text) throw new Error("No text found in PDF");

        // 3. ask AI
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                temperature: 0,
                messages: [
                    {
                        role: "system",
                        content: `You are an intelligent receipt analysis assistant. 
Your job is to carefully read receipt text and extract accurate structured data.
You MUST return ONLY raw JSON — no markdown, no backticks, no explanation, no preamble.
Never guess or fabricate values. If a field is missing, use null or an empty string.`,
                    },
                    {
                        role: "user",
                        content: `Analyze the following receipt text and return ONLY a raw JSON object with these exact fields:

- merchantName: Name of the store or vendor
- merchantAddress: Full address of the store
- merchantPhoneNumber: Phone number of the store
- transactionDate: Date and time of the transaction (as written on receipt)
- transactionAmount: Final total amount paid (numeric value only)
- currency: Currency used (e.g. USD, PKR, EUR)
- paymentMethod: How it was paid (e.g. Cash, Credit Card, Debit Card, Digital Wallet)
- receiptNumber: Receipt, invoice, or order reference number
- subtotal: Amount before tax and discounts
- taxAmount: Total tax charged
- discountAmount: Total discount or coupon applied (0 if none)
- items: Array of purchased items, each with:
    - name: Item name
    - quantity: Quantity purchased
    - unitPrice: Price per unit
    - totalPrice: Total price for that item
- receiptSummary: Write a natural, friendly 3 to 4 sentence summary of this receipt.
  Start with the store name and date (if available).
  Then mention each item purchased along with its individual price (e.g. "Burger ($5.99), Fries ($2.99), Soda ($1.65)").
  End with the total amount paid and a one-line description of the type of purchase (e.g. dining, groceries, electronics).
  Do NOT mention any fields that are missing — simply skip them.
  Do NOT use phrases like "unspecified", "not indicated", "not available", or "not provided".
  Write in a friendly, informative tone suitable for a personal finance tracker app.
  Example: "You visited Little Bistro on March 5th and ordered a Burger ($5.99), Fries ($2.99), and a Soda ($1.65). The total amount paid was $15.63. This appears to be a casual dining purchase."

Receipt text:
${text}`,
                    },
                ],
            }),
        });

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) throw new Error("No AI response");

        let parsed;

        try {
            const cleaned = content
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();
            parsed = JSON.parse(cleaned);
        } catch (e) {
            console.log("BAD JSON:", content);
            throw new Error("AI did not return valid JSON");
        }

        console.log("FINAL DATA:", parsed);

        // 4. save to convex
        await convex.mutation(api.receipts.updateReceiptWithExtractedData, {
            id: event.data.receiptId,

            fileDisplayName: parsed.merchantName && parsed.transactionDate
                ? `${parsed.merchantName} - ${parsed.transactionDate}`
                : parsed.merchantName || parsed.transactionDate || "receipt",

            merchantName: parsed.merchantName || "",
            merchantAddress: parsed.merchantAddress || "",
            merchantPhone: parsed.merchantPhoneNumber || "",

            transactionDate: parsed.transactionDate || "",
            totalAmount: String(parsed.transactionAmount || "0"),

            receiptSummary: parsed.receiptSummary || "",
            currency: parsed.currency || "",

            items: (parsed.items || []).map((item: {
                name?: string;
                quantity?: number | string;
                unitPrice?: number | string;
                totalPrice?: number | string;
            }) => ({
                name: item.name || "",
                quantity: Number(item.quantity) || 1,
                unitPrice: parseFloat(String(item.unitPrice || "0")) || 0,
                totalPrice: parseFloat(String(item.totalPrice || "0")) || 0,
            })),
        });

        return { success: true };
    }
);