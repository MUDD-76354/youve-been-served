import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/mobile", label: "Mobile" },
  { href: "/admin", label: "Admin" },
];

export default function Nav() {
  return (
    <nav className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-6 px-6 py-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}