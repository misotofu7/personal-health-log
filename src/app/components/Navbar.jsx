'use client'

import Image from "next/image";

import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { X, Menu } from "lucide-react"; // why do i need to manually import this stuff??

const navItems = [
    {name: "home.", href: "/"},
    {name: "calendar", href: "/calendar"},
    {name: "chat", href: "/chat"},
    {name: "heatttt", href: "/heatcalendar"},

]

export const Navbar = () => {
    
    
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
 
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.screenY > 10)
        }

        window.addEventListener("scroll", handleScroll); 
        return () => window.removeEventListener("scroll", handleScroll); 
    
    }, []);
    

    return (
        <nav 
        className = {cn(
        "fixed w-full z-40 transition-all duration-300 py-5"
    )}
    > 
    <div className = "container flex items-center justify-between">
        <a href = "/" className = "text-xl font-bold text-primary flex items-center"> 
            <span className = "relative z-10 ml-3">
        <Image
          src="/logo.png"
          alt="Logo"
          width={70}
          height={70}
        />
    
            </span>
                
                
        </a>

        { /* apparently desktop nav */}
        <div className = "hidden md:flex space-x-8">
            {navItems.map((item, key) => (
                <a key = {key} href={item.href} className="text-foreground/80 hover:text-blue-400 transition-colors duration-300">
                    {item.name}
                </a>
            ))}
        </div>
        
        

        { /* mobile nav */ } 
        
        <button 
            onClick = {() => setIsMenuOpen((prev) => !prev)}
            className="md:hidden p-2 text-foreground z-50 focus:text-primary"
            aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            >
            {isMenuOpen ? <X size = {24} /> : <Menu size = {24}/> }
            </button>
        
        <div 
        className = {cn(
            "fixed inset-0 bg-background/50 backdrop-blur-md z-40 flex flex-col items-center justify-center",
            "transition-all duration-300 md:hidden",
            isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        >
            <div className = "flex flex-col space-y-8 text-xl">
                {navItems.map((item, key) => (
                <a key = {key} href={item.href} className="text-blue-200 hover:text-blue-400 transition-colors duration-300" onClick = {() => setIsMenuOpen(false)}>
                    {item.name}
                </a>
                ))}
            </div>
        </div>

    </div>
    </nav>
    );
}
