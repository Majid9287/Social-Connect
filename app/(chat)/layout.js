import { Inter } from "next/font/google";
import "../globals.css";
import TopBar from "@components/TopBar";
import BottomBar from "@components/BottomBar";
import { ClerkProvider } from "@clerk/nextjs";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Halo Chat App",
  description: "A Next.js 14 Chat App ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-blue-2`}>
      <ClerkProvider>
          <TopBar />
          {children}
          <BottomBar />
          </ClerkProvider>
      </body>
    </html>
  );
}
