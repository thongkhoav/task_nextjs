"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Update the document title using the browser API
  }, []);
  return (
    <div className="h-screen flex justify-center items-center">
      <Link href="/rooms" className="py-2 px-4 rounded-sm bg-slate-200">
        Go to room list
      </Link>
    </div>
  );
}
