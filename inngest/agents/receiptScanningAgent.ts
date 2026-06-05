// import { createAgent, createTool, openai } from "@inngest/agent-kit";
// import { z } from "zod";
// import { extractPdfText } from "@/lib/extractPdfText";

// const parsePdfTool = createTool({
//     name: "parse-pdf",
//     description: "Extract receipt data from PDF and convert into structured JSON",

//     parameters: z.object({
//         pdfUrl: z.string(),
//         receiptId: z.string(),
//     }),

//     handler: async ({ pdfUrl }, context) => {
//         // 1. Download PDF
//         const res = await fetch(pdfUrl);
//         const buffer = Buffer.from(await res.arrayBuffer());

//         // 2. Extract text
//         const text = await extractPdfText(buffer);

//         // 3. OpenAI call (STRICT JSON)
//         const response = await fetch("https://api.openai.com/v1/chat/completions", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
//             },
//             body: JSON.stringify({
//                 model: "gpt-4o-mini",
//                 temperature: 0,
//                 messages: [
//                     {
//                         role: "user",
//                         content: `
// You are a receipt parser.

// Return ONLY valid JSON. No text.

// Extract from this receipt:

// ${text}

// JSON format:
// {
//   "merchantName": "",
//   "merchantAddress": "",
//   "merchantPhoneNumber": "",
//   "transactionDate": "",
//   "transactionAmount": "",
//   "currency": "",
//   "receiptSummary": "",
//   "items": [
//     {
//       "name": "",
//       "quantity": 0,
//       "unitPrice": 0,
//       "totalPrice": 0
//     }
//   ]
// }
// `
//                     }
//                 ]
//             }),
//         });

//         const data = await response.json();

//         const content = data.choices?.[0]?.message?.content || "{}";

//         let parsed;
//         try {
//             parsed = JSON.parse(content);
//         } catch {
//             parsed = {};
//         }

//         context.network?.state.kv.set("scanned", true);
//         context.network?.state.kv.set("extracted-data", parsed);

//         return { extracted: parsed };
//     },
// });

// export const receiptScanningAgent = createAgent({
//     name: "Receipt Scanning Agent",

//     description: "Extracts structured receipt data from PDF",

//     system: `
// You MUST call parse-pdf tool.
// Do NOT guess data.
// Do NOT return text.
// Only rely on tool output.
//     `,

//     model: openai({
//         model: "gpt-4o-mini",
//         defaultParameters: { max_completion_tokens: 2000 },
//     }),

//     tools: [parsePdfTool],
// });