"use client";

import { useState, useEffect } from "react";
import { ViewToggle } from "../components/ViewToggle";
import { Calendar } from "../components/Calendar";
import { YearCalendar } from "../components/YearCalendar";

/* note that Date objects are built into javascript as pre-existing classes */

export default function Home() {
    const [isYearView, setYearView] = useState(false);

    useEffect(() => {
        const storedViewType = localStorage.getItem("viewType");

        if(storedViewType === "year"){
            setYearView(true);
        }
        else{
            localStorage.setItem("viewType", "month"); // if it doesn't exist yet, then add it?
            setYearView(false);
        }

    }, []) // initialize default view type to monthlong

console.log("isYearView in Home:", isYearView);

  return <div className = "relative min-h-screen"> 

  
    
        <main>

            <ViewToggle isYearView={isYearView} setYearView={setYearView} />
            { isYearView ? 
            <YearCalendar/> : <Calendar/> }

         
        </main>
    </div>
  
}