import { Inter } from "next/font/google";
import { Geist } from 'next/font/google'
import { Roboto } from 'next/font/google'
import "./globals.css";
import NavBar from "@/components/NavBar/NavBar";

const inter = Inter({
  subsets: ["latin"],
  weight: ['300','500','600', '700'],
});

const geist = Geist({
  subsets: ['latin'],
  weight: ['300','500','600', '700'],
})

const roboto = Roboto({
  weight: ['300','400','500','600', '700'],
  subsets: ['latin'],
})

export const metadata = {
  title: "Luke Birchenough",
  description: "Luke Birchenough's Personal Website",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={roboto.className}>
      {/* <body className={inter.className}> */}
        <NavBar />
        {children}
      </body>
    </html>
  );
}
