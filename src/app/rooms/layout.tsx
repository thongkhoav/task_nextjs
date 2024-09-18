export default function RoomLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col justify-center   w-full max-w-[2000px]">
      {children}
    </div>
  );
}
