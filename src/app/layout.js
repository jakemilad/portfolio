import "@/styles/globals.css";
import VintageCursor from "@/components/VintageCursor";

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
    <html lang="en">
      <body className="antialiased">
        {/* <VintageCursor /> */}
        {children}
      </body>
    </html>
  );
}
