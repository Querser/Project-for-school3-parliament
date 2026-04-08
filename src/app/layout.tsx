import type { Metadata, Viewport } from "next";
import { Merriweather, Noto_Sans } from "next/font/google";

import "./globals.css";

const themeInitScript = `
(() => {
  try {
    const root = document.documentElement;
    const theme = localStorage.getItem("school-parliament:theme");
    const vision = localStorage.getItem("school-parliament:vision");
    if (theme === "dark") root.classList.add("theme-dark");
    if (vision === "strong") root.classList.add("vision-strong");
  } catch {}
})();
`;

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin", "cyrillic"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Ученический парламент МОУ СОШ в„–3 г. Можайска",
  description: "Официальный информационный портал ученического парламента",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${notoSans.variable} ${merriweather.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

