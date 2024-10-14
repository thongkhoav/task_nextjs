import { Metadata } from "next";
import { Inter } from "next/font/google";
import AppProvider from "./providers/app-provider";

export const metadata: Metadata = {
  title: "Task System",
  description: "Task Management System",
};
const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} w-full bg-[url('/gradient_bg.webp')] bg-cover bg-center`}
      >
        <AppProvider>
          <div className="flex justify-center items-start ">
            <div className="container flex justify-center max-w-[1000px]">
              {children}
            </div>
          </div>
        </AppProvider>
        {/* {children} */}
      </body>
    </html>
  );
}
