"use client";

import { HeatCalendar } from "../components/HeatCalendar";

/* note that Date objects are built into javascript as pre-existing classes */

export default function Home() {


  return <div className = "relative min-h-screen"> 

  
    
        <main>

            <HeatCalendar/>

         
        </main>
    </div>
  
}