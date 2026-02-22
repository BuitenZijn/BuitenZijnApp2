import Image from "next/image";

export function Footer() {
  return (
    <footer className="py-10 px-6 border-t border-beige-300 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
        <Image
          src="/buitenzijn_logo_color.png"
          alt="BuitenZijn"
          width={160}
          height={46}
          className="h-12 w-auto"
        />
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} VZW BuitenZijn. Alle rechten
          voorbehouden.
        </p>
      </div>
    </footer>
  );
}
