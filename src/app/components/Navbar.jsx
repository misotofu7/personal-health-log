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
  const [ttsEnabled, setTtsEnabled] = useState('urgent'); // 'off', 'urgent', 'all'

  // Load TTS setting from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ttsEnabled');
      if (saved) {
        setTtsEnabled(saved);
      }
    }
  }, []);

  const toggleTTS = () => {
    const next = ttsEnabled === 'off' ? 'urgent' : ttsEnabled === 'urgent' ? 'all' : 'off';
    setTtsEnabled(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ttsEnabled', next);
    }
  };

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
                        <Image src="/logo.png" alt="Logo" width={55} height={55} priority className="hover:scale-102 duration-200" />
                <h1 className = "font-bold text-2xl hover:scale-102 duration-200"> Pulsify </h1>
            </a>

            <div className={styles.navRight}>
                <div className={styles.navLinks}>
                    {navItems.map((item) => (
                    <a key={item.href} href={item.href} className={styles.navLink}>
                        {item.name}
                    </a>
                    ))}
                </div>

                {/* Only show login/logout when we know the actual state */}
                {isLoading ? null : !user ? (
                    <a href="/api/auth/login" className={`${styles.authButton} ${styles.login}`}>
                    Log in
                    </a>
                ) : (
                    <a href="/api/auth/logout" className={`${styles.authButton} ${styles.logout}`}>
                    Log out
                    </a>
                )}

                <ThemeToggle />

                {/* TTS Toggle */}
                <button
                  onClick={toggleTTS}
                  className={styles.authButton}
                  title={`TTS: ${ttsEnabled === 'off' ? 'Off' : ttsEnabled === 'urgent' ? 'Urgent Only' : 'All Responses'}`}
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    minWidth: 'auto',
                    marginRight: '8px'
                  }}
                >
                  🔊 {ttsEnabled === 'off' ? 'Off' : ttsEnabled === 'urgent' ? 'Urgent' : 'All'}
                </button>

          
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