"use client";

import { useState, useEffect } from "react";
import { ViewToggle } from "../components/ViewToggle";
import { Calendar } from "../components/Calendar";
import { YearCalendar } from "../components/YearCalendar";

/* note that Date objects are built into javascript as pre-existing classes */

export default function Home() {
  return <div className = "relative min-h-screen"> 

  
    
        <main>

            <YearCalendar/>

         
        </main>
    </div>
  
}