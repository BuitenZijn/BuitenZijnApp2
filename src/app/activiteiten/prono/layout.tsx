import { Navbar } from "@/components/layout";

export default function PronoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
    </>
  );
}
