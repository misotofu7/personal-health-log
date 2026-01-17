"use client";

import { useState, useEffect } from "react";
import { ViewToggle } from "../components/ViewToggle";
import { Calendar } from "../components/Calendar";
import { YearCalendar } from "../components/YearCalendar";
import { ModalPopup } from "../components/ModalPopup";

/* note that Date objects are built into javascript as pre-existing classes */

export default function Home() {
  return <div className = "relative min-h-screen"> 

  
    
        <main>

            <ModalPopup/>

         
        </main>
    </div>
  
}