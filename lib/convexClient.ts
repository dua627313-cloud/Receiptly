import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api"

// create a Convex HTTP client for server-side actions
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
export default convex;