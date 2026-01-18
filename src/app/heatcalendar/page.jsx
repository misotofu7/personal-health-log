"use client";

import { HeatCalendar } from "../components/HeatCalendar";
import { Navbar } from "../components/Navbar";

/* note that Date objects are built into javascript as pre-existing classes */

export default function Home() {


  return <div className = "relative min-h-screen"> 

  <Navbar/>
    
        <main className="mt-20">

            

            <HeatCalendar/>

         
        </main>
    </div>
  
}