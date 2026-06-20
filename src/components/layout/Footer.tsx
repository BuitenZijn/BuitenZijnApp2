import Image from "next/image";
import Link from "next/link";

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
        <div className="flex gap-6 text-sm text-gray-500">
          <Link
            href="/privacy-policy"
            className="hover:text-green-700 transition-colors"
          >
            Privacybeleid
          </Link>
          <Link
            href="/account"
            className="hover:text-green-700 transition-colors"
          >
            Mijn account
          </Link>
          <Link
            href="/contact"
            className="hover:text-green-700 transition-colors"
          >
            Contact
          </Link>
        </div>
        <p className="text-gray-400 text-xs">
          &copy; {new Date().getFullYear()} VZW BuitenZijn. Alle rechten
          voorbehouden.
        </p>
      </div>
    </footer>
  );
}
