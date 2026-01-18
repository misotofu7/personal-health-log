"use client";

import { HeatCalendar } from "../components/HeatCalendar";
import { Navbar } from "../components/Navbar";
import { useUser } from "@auth0/nextjs-auth0/client";

/* note that Date objects are built into javascript as pre-existing classes */

export default function Home() {
  const { user, isLoading } = useUser();
  
  return (
    <div className = "relative min-h-screen"> 
        <Navbar user={user} isLoading={isLoading} />
        <main className="mt-20">
            <HeatCalendar/>
        </main>
    </div>
  );
}