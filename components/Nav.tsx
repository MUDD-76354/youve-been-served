import Link from "next/link";

export default function Nav() {
  return (
    <nav className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-6 px-6 py-4">
        <Link
          href="/"
          className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
        >
          Home
        </Link>
      </div>
    </nav>
  );
}