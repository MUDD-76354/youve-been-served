import { getDashboardStats, Job } from "@/lib/admin";

type DashboardOverviewProps = {
  jobs: Job[];
};

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {detail ? <p className="mt-2 text-sm text-gray-600">{detail}</p> : null}
    </div>
  );
}

export default function DashboardOverview({ jobs }: DashboardOverviewProps) {
  const stats = getDashboardStats(jobs);

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
        <p className="mt-1 text-sm text-gray-600">
          Monitor open workload and today&apos;s field activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Open Jobs"
          value={stats.totalOpenJobs}
          detail="Assigned or in progress"
        />
        <StatCard
          label="Attempts Today"
          value={stats.attemptsToday}
          detail="Logged across all active jobs"
        />
        <StatCard
          label="Completed Jobs"
          value={stats.completedCount}
          detail="Closed and off the board"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Stats Summary</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-blue-50 px-4 py-3">
            <p className="text-sm text-blue-700">Assigned</p>
            <p className="text-2xl font-bold text-blue-900">{stats.assignedCount}</p>
          </div>
          <div className="rounded-lg bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-700">In Progress</p>
            <p className="text-2xl font-bold text-amber-900">{stats.inProgressCount}</p>
          </div>
          <div className="rounded-lg bg-purple-50 px-4 py-3">
            <p className="text-sm text-purple-700">On Hold</p>
            <p className="text-2xl font-bold text-purple-900">{stats.onHoldCount}</p>
          </div>
          <div className="rounded-lg bg-green-50 px-4 py-3">
            <p className="text-sm text-green-700">Completed</p>
            <p className="text-2xl font-bold text-green-900">{stats.completedCount}</p>
          </div>
        </div>
      </div>
    </section>
  );
}