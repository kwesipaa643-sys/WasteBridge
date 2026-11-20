import "./globals.css";
export const metadata = { title: "WasteBridge", manifest: "/manifest.webmanifest" };
export const viewport = { themeColor: "#10b981" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className="dark" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem("wb-theme")==="light")document.documentElement.classList.add("light")}catch(e){}` }} /></head>
      <body>{children}</body>
    </html>;
}
