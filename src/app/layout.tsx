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
      <body className={`${inter.className} min-h-screen w-full`}>
        <AppProvider>
          <div className="mt-10 flex justify-center">
            <div className="container">{children}</div>
          </div>
        </AppProvider>
        {/* {children} */}
      </body>
    </html>
  );
}
