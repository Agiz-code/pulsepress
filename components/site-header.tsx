'use client';

import { useEffect, useState } from "react";
import { AuthActions } from "./auth-actions";

const navItems = [
  { label: "Home", href: "/", active: true },
  { label: "Top News", href: "/#top-news-title" },
];

export function SiteHeader({ brand }: { brand: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMenuOpen]);

  return (
    <header className="masthead">
      <div className="page-shell masthead__inner">
        <button
          className="menu-button"
          type="button"
          aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

        {brand}

        <nav className="main-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a key={item.label} className={item.active ? "is-active" : ""} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="masthead__actions">
          <AuthActions />
        </div>
      </div>

      <nav id="mobile-navigation" className={`mobile-nav ${isMenuOpen ? "is-open" : ""}`} aria-label="Mobile navigation">
        {navItems.map((item) => (
          <a key={item.label} className={item.active ? "is-active" : ""} href={item.href} onClick={() => setIsMenuOpen(false)}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
