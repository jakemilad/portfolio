import "@/styles/globals.css";
import localFont from "next/font/local";
import { Bricolage_Grotesque } from "next/font/google";
import GlobalMusicPlayer from "@/components/GlobalMusicPlayer";
import GlobalThemeSwitcher from "@/components/GlobalThemeSwitcher";
import TimeMachine from "@/components/modern/TimeMachine";

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata = {
  title: "Jake's Website",
  description: "Jake Milad's Portfolio - Interactive 3D Avatar and More!",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var savedTheme = localStorage.getItem('portfolio-theme');
                var themes = ['classic', 'cyber', 'toxic', 'sunset', 'ice'];
                if (themes.includes(savedTheme)) document.documentElement.dataset.theme = savedTheme;
                if (localStorage.getItem('portfolio-era') === '2026') document.documentElement.dataset.era = '2026';
              } catch (error) {}
            `,
          }}
        />
      </head>
      <body className={`antialiased ${geist.variable} ${geistMono.variable} ${bricolage.variable}`}>
        <GlobalMusicPlayer />
        <GlobalThemeSwitcher />
        {children}
        <TimeMachine />
      </body>
    </html>
  );
}
