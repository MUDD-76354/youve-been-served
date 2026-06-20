type AdminView =
  | "dashboard"
  | "create"
  | "createUser"
  | "manageUsers"
  | "jobs"
  | "completed"
  | "attempts"
  | "reports";

type AdminNavProps = {
  activeView: AdminView;
  onViewChange: (view: AdminView) => void;
};

const navItems: { id: AdminView; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "create", label: "Create Job" },
  { id: "createUser", label: "Create User" },
  { id: "manageUsers", label: "Manage Users" },
  { id: "jobs", label: "Jobs List" },
  { id: "completed", label: "Completed" },
  { id: "attempts", label: "Attempts" },
  { id: "reports", label: "Reports" },
];

export default function AdminNav({ activeView, onViewChange }: AdminNavProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
            Bohn &amp; Associates
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
        </div>

        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeView === item.id
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export type { AdminView };