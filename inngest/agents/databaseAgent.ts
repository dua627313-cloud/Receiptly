// import { createAgent, createTool, openai } from "@inngest/agent-kit";
// import { z } from "zod";
// import convex from "@/lib/convexClient";
// import { api } from "@/convex/_generated/api";
// import { Id } from "@/convex/_generated/dataModel";
// import { client } from "@/lib/schematic";

// const saveToDatabaseTool = createTool({
//     name: "save-to-database",

//     description: "Save structured receipt data into Convex",

//     parameters: z.object({
//         receiptId: z.string(),

//         fileDisplayName: z.string().optional(),

//         merchantName: z.string().default(""),
//         merchantAddress: z.string().default(""),
//         merchantPhoneNumber: z.string().default(""),

//         transactionDate: z.string().default(""),
//         transactionAmount: z.string().default("0"),
//         currency: z.string().default(""),

//         receiptSummary: z.string().default(""),

//         items: z.array(
//             z.object({
//                 name: z.string().default(""),
//                 quantity: z.number().default(0),
//                 unitPrice: z.number().default(0),
//                 totalPrice: z.number().default(0),
//             })
//         ).default([]),
//     }),

//     handler: async (params, context) => {
//         try {
//             await convex.mutation(api.receipts.updateReceiptWithExtractedData, {
//                 id: params.receiptId as Id<"receipts">,

//                 fileDisplayName: params.fileDisplayName || "",

//                 merchantName: params.merchantName,
//                 merchantAddress: params.merchantAddress,
//                 merchantPhone: params.merchantPhoneNumber,

//                 transactionDate: params.transactionDate,
//                 totalAmount: params.transactionAmount,

//                 receiptSummary: params.receiptSummary,
//                 currency: params.currency,

//                 items: params.items,
//             });

//             context.network?.state.kv.set("saved-to-database", true);

//             await client.track({
//                 event: "scan",
//                 company: { id: params.receiptId },
//                 user: { id: params.receiptId },
//             });

//             return { success: true };
//         } catch (err) {
//             return { success: false, error: String(err) };
//         }
//     },
// });

// export const databaseAgent = createAgent({
//     name: "Database Agent",

//     system: `
// You receive a JSON receipt object.
// Call save-to-database tool immediately.
// Do not modify or ask questions.
// If fields are missing, still call tool.
//     `,

//     model: openai({
//         model: "gpt-4o-mini",
//     }),

//     tools: [saveToDatabaseTool],
// });