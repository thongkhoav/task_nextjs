"use client";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Update the document title using the browser API
  }, []);
  return (
    <div>
      <h1>Home Page</h1>
      <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
    </div>
  );
}
