"use client";

import { getStoredRole, type UserRole } from "@/lib/role";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavLink = {
  href: string;
  label: string;
  roles: UserRole[] | "all";
};

const links: NavLink[] = [
  { href: "/", label: "Home", roles: "all" },
  { href: "/mobile", label: "Mobile", roles: ["process_server"] },
  { href: "/admin", label: "Admin", roles: ["admin"] },
];

function isLinkVisible(link: NavLink, role: UserRole | null): boolean {
  if (link.roles === "all") {
    return true;
  }

  if (!role) {
    return link.href === "/";
  }

  return link.roles.includes(role);
}

export default function Nav() {
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    setRole(getStoredRole());
  }, [pathname]);

  const visibleLinks = links.filter((link) => isLinkVisible(link, role));
  const homeHref = role ? "/?switch=1" : "/";

  return (
    <nav className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-6 px-6 py-4">
        {visibleLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href === "/" ? homeHref : link.href}
            prefetch={link.href === "/" ? undefined : false}
            className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}