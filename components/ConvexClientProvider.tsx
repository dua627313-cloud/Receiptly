"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { SchematicProvider , useSchematicEvents } from "@schematichq/schematic-react";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const SchematicWrapped = ({children}: {children: React.ReactNode}) =>{
  const {identify} = useSchematicEvents();
  const {user} = useUser();
  useEffect(() => {
    const userName = 
    user?.username ??
    user?.fullName ??
    user?.emailAddresses[0]?.emailAddress ??
    user?.id ;
    if(user?.id){
      identify({
        name: userName,
        //User Level Keys
        keys:{
          id: user.id,
        },
        // Company Level Keys
        company: {
          keys: {
            id: user.id,
          },
          name: userName,
        }
      })
    }

  },[user, identify]);
  return children;
}
export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <SchematicProvider
        publishableKey={process.env.NEXT_PUBLIC_SCHEMATIC_KEY!}
        >
        <SchematicWrapped>
        {children}
        </SchematicWrapped>
      </SchematicProvider>
    </ConvexProviderWithClerk>
  );
}
