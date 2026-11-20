"use client";
import { useEffect, useState } from "react";
export default function ThemeToggle() {
  const [light, setLight] = useState(false);
  useEffect(() => setLight(document.documentElement.classList.contains("light")), []);
  const toggle = () => {
    const next = !light; setLight(next);
    document.documentElement.classList.toggle("light", next);
    try { localStorage.setItem("wb-theme", next ? "light" : "dark"); } catch {}
  };
  return <button onClick={toggle} aria-label="Toggle light and dark mode" className="ml-auto">{light ? "🌙" : "☀️"}</button>;
}
