"use server";
import { auth } from "@clerk/nextjs/server";
import convex from "../lib/convexClient";
import { api } from "@/convex/_generated/api";
import { getFileDownloadUrl } from "./getFileDownloadUrl";
import { inngest } from "@/inngest/client";
import Events from "@/inngest/constants";

export async function uploadPDF(formData: FormData) {
    const authResult = await auth();
    const userId = authResult.userId;

    if (!userId) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const file = formData.get("file") as File;

        if (!file) {
            return { success: false, error: "No file uploaded" };
        }

        if (
            !file.type.includes("pdf") &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {
            return { success: false, error: "Invalid file type. Please upload a PDF." };
        }

        // Normalize MIME type — browsers sometimes send empty string for PDFs
        const mimeType = file.type || "application/pdf";

        const uploadUrl = await convex.mutation(api.receipts.generateUploadUrl, {});

        // Debug logs — check your server terminal for these
        console.log("uploadUrl:", uploadUrl);
        console.log("file.type:", file.type);
        console.log("mimeType:", mimeType);

        // Validate the URL is absolute before fetching
        if (!uploadUrl || !uploadUrl.startsWith("http")) {
            throw new Error(`Invalid upload URL received from Convex: "${uploadUrl}"`);
        }

        const arrayBuffer = await file.arrayBuffer();

        const uploadResponse = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                "Content-Type": mimeType,
            },
            body: new Uint8Array(arrayBuffer),
        });

        if (!uploadResponse.ok) {
            throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
        }

        const { storageId } = await uploadResponse.json();

        const receiptId = await convex.mutation(api.receipts.storeReceipt, {
            userId,
            fileId: storageId,
            fileName: file.name,
            size: file.size,
            mimeType, // normalized
        });

        const fileUrl = await getFileDownloadUrl(storageId);

        await inngest.send({
            name: Events.EXTRACT_DATA_FROM_PDF_AND_SAVE_TO_DATABASE,
            data: {
                url: fileUrl.downloadUrl,
                receiptId,
            },
        });

        return {
            success: true,
            data: {
                receiptId,
                fileName: file.name,
            },
        };

    } catch (error) {
        console.error("Server action upload error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}