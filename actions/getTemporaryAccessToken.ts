"use server";
import { currentUser } from "@clerk/nextjs/server";
// Initialize Schematic SDK
import { SchematicClient } from "@schematichq/schematic-typescript-node";
const apiKey = process.env.SCHEMATIC_API_KEY;
const client = new SchematicClient({ apiKey });
// Get temporary access token for the current user
export async function getTemporaryAccessToken() {
  const user = await currentUser();
    if (!user) {
    console.log("No user found , returning null");
    return null;
  }
  console.log(`Issuing temporary access token for user : ${user.id}`);
  const resp = await client.accesstokens.issueTemporaryAccessToken({
    lookup: {id: user.id},
  });
  console.log("Token response received:" , resp.data?"Token received" : "No token in response");
    return resp.data?.token;
}