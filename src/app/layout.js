import "@/styles/globals.css";

export const metadata = {
  title: "Jake's Website",
  description: "Jake Milad's Portfolio - Interactive 3D Avatar and More!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
