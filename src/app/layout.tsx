import type { Metadata } from "next";
import localFont from 'next/font/local'
import {NavBar} from './components/navbar';
import "./globals.scss";

const cameraPlain = localFont({
  src: './fonts/ABCCameraPlain-Regular.otf',
  variable: "--font-camera-plain"
});
const dreamOrphans = localFont({
  src: './fonts/DreamOrphansBd.woff2',
  variable: "--font-dream-orphans"
});

export const metadata: Metadata = {
  title: "Coachella Scheduler",
  description: "Create your festival schedule and share with friends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cameraPlain.variable} ${dreamOrphans.variable}`}>
        <div className="App">
          {/* <div className="background">
            <img src="/homepage-gradient-hero-left.png" id="bg1" alt="background" />
            <img src="/homepage-gradient-hero-right.png" id="bg2" alt="background" />
          </div> */}
          <div className="content">
            <NavBar />
            {children}
          </div>
        </div>

      </body>
    </html>
  );
}
