export default function RoomLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col justify-center min-h-screen">{children}</div>
  );
}
