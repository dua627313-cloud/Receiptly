import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// function to generate a Convex upload URL for the client.
export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        // generate a url that a client can use to upload a file.
        return await ctx.storage.generateUploadUrl();
        }
});

// store a receipt file and add it to the database
export const storeReceipt = mutation({
    args: {
        userId: v.string(),
        fileName: v.string(),
        fileId: v.id("_storage"),
        size: v.number(),
        mimeType: v.string(),
    },
    handler: async(ctx , args) =>{
        // save the receipt to database.
        const receiptId = await ctx.db.insert("receipts", {
            userId: args.userId,
            fileName: args.fileName,
            fileId: args.fileId,
            uploadedAt: Date.now(),
            size: args.size,
            mimeType: args.mimeType,
            status: "pending",
            // initialize extracted data fields as null
            merchantName: undefined,
            merchantAddress: undefined,
            merchantPhone: undefined,
            transactionDate: undefined,
            totalAmount: undefined,
            currency: undefined,
            items: [],
        });
        return receiptId;
        }
    });
// function to get all receipts
export const getReceipts = query({
    args: {
        userId: v.string(),
    },
    handler: async(ctx , args) =>{
        // only return receipts for the authenticated user.
        return await ctx.db.query("receipts").filter((q)=> q.eq(q.field("userId") , args.userId)).order("desc").collect();
    },
});

// function to get a single receipt by id
export const getReceiptById = query({
    args: {
        id: v.id("receipts"),
    },
    handler: async(ctx , args) =>{
        // get the receipt
        const receipt = await ctx.db.get("receipts" , args.id);
        // ensure the user can only access their own receipts.
        if(receipt){
            const identity = await ctx.auth.getUserIdentity();
            if(!identity){
                throw new Error("Unauthorized");
            }
            const userId = identity.subject;
            if(receipt.userId !== userId){
                throw new Error("Unauthorized");
            }
        }
        return receipt;
    },
});
// generate a url to download a receipt file
export const generateDownloadUrl = query({
    args: {
        fileId: v.id("_storage"),
    },
    handler: async(ctx , args) =>{
        // get a temporary url that can be used to download the file.
        return await ctx.storage.getUrl(args.fileId);
    },
});
// update the status of a receipt
export const updateReceiptStatus = mutation({
    args: {
        id: v.id("receipts"),
        status: v.string(),
    },
    handler: async(ctx , args) =>{
        // verify user has access to this receipt
        const receipt = await ctx.db.get("receipts" , args.id);
        if(!receipt){
            throw new Error("Receipt not found");
        }
        const identity = await ctx.auth.getUserIdentity();
        if(!identity){
            throw new Error("Unauthorized");
        }
        const userId = identity.subject;
        if(receipt.userId !== userId){
            throw new Error("Unauthorized");
        }
        await ctx.db.patch(args.id , {
            status: args.status,
        });
        return true;
    }
        });
    // delete a receipt and its file
export const deleteReceipt = mutation({
    args: {
        id: v.id("receipts"),
    },
    handler: async(ctx , args) =>{
        const receipt = await ctx.db.get(args.id);
        if(!receipt){
            throw new Error("Receipt not found");
        }

        // verify user has access to this receipt
        // const identity = await ctx.auth.getUserIdentity();
        // if(!identity){
        //     throw new Error("Unauthorized");
        // }
        // const userId = identity.subject;
        // if(receipt.userId !== userId){
        //     throw new Error("Unauthorized");
        // }
        // delete the file from storage
        await ctx.storage.delete(receipt.fileId);
        // delete the receipt record
        await ctx.db.delete(args.id);
        return true;
    },
});
// update receipt with extracted data
export const updateReceiptWithExtractedData = mutation({
    args: {
        id: v.id("receipts"),
        fileDisplayName: v.string(),
        merchantName: v.string(),
        merchantAddress: v.string(),
        merchantPhone: v.string(),
        transactionDate: v.string(),
        totalAmount: v.string(),
        currency: v.string(),
        receiptSummary: v.string(),
        items: v.array(
            v.object({
                name: v.string(),
                quantity: v.number(),
                unitPrice: v.number(),
                totalPrice: v.number(),
            }),
        ),
    },
    handler: async(ctx , args) =>{
        // verify the receipt exists
        const receipt = await ctx.db.get(args.id);
        if(!receipt){
            throw new Error("Receipt not found");
        }

        // update the receipt with the extracted data 
        await ctx.db.patch(args.id , {
            fileDisplayName: args.fileDisplayName,
            merchantName: args.merchantName,
            merchantAddress: args.merchantAddress,
            merchantPhone: args.merchantPhone,
            transactionDate: args.transactionDate,
            totalAmount: args.totalAmount,
            currency: args.currency,
            receiptSummary: args.receiptSummary,
            items: args.items,
            status: "processed",
        });
        return {
            userId: receipt.userId,
        }
    },
});