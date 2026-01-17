'use client'

import { Moon, Sun } from "lucide-react";
import { useEffect, useInsertionEffect, useState } from "react";

export const ViewToggle = ({ isYearView, setYearView }) => {

    const toggleViewType = () => {
        if(isYearView){
            localStorage.setItem("viewType", "month"); // set back to month if it's currently year
            setYearView(false);
        }
        else {
            localStorage.setItem("viewType", "year");
            setYearView(true);

        }
    }

    // end of useEffect

        return (
            <button onClick = {toggleViewType}
            className = "fixed max-sm:hidden top-5 right-5 p-2 rounded-full transition-colors duration-300 focus:outline-hidden z-50" 
            /*

             className = {cn("fixed max-sm:hidden top-5 right-5 p-2 rounded-full transition-colors duration-300 focus:outline-hidden" )}
            */
    >
        
    
            {isYearView ? (
             <Sun className = "h-6 w-6 text-indigo-700" /> 
                ) : ( 
            <Moon className = "h-6 w-6 text-green-500" /> ) } 
    
             </button>
        );



    
    
}