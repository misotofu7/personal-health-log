"use client";

import styles from "./Navbar.module.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import { X, Menu } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { name: "Live Chat", href: "/chat" },
  { name: "Calendar", href: "/calendar" },
  { name: "Heat", href: "/heatcalendar" },
];

export const Navbar = ({ user = null, isLoading = false, ThemeToggleComponent = null }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
        <div className={styles.navContent}>
            <a href="/" className={styles.brand} aria-label="Home">
                <Image src="/logo.png" alt="Logo" width={70} height={70} priority />
            </a>

            <div className={styles.navRight}>
                <div className={styles.navLinks}>
                    {navItems.map((item) => (
                    <a key={item.href} href={item.href} className={styles.navLink}>
                        {item.name}
                    </a>
                    ))}
                </div>

                {!isLoading && !user && (
                    <a href="/auth/login" className={`${styles.authButton} ${styles.login}`}>
                    Log in
                    </a>
                )}

                {!isLoading && user && (
                    <a href="/auth/logout" className={`${styles.authButton} ${styles.logout}`}>
                    Log out
                    </a>
                )}

                <ThemeToggle />

                {!isLoading && !user && (
                    <a href="/auth/login" className={`${styles.authButton} ${styles.login}`}>
                    Log in
                    </a>
                )}

                {ThemeToggleComponent
                    ? typeof ThemeToggleComponent === "function"
                    ? <ThemeToggleComponent />
                    : ThemeToggleComponent
                    : null}

                <button
                    type="button"
                    onClick={() => setIsMenuOpen((p) => !p)}
                    className={styles.menuButton}
                    aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </div>
    </nav>
  );
};