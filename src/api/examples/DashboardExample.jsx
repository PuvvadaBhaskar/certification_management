import { useEffect, useState } from "react";
import { getDashboard } from "../dashboard";

function DashboardExample({ userId }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getDashboard(userId);
        setDashboard(data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [userId]);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  return (
    <div>
      <h3 className="mb-2 text-lg font-semibold">Dashboard Data</h3>
      <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-sm">
        {JSON.stringify(dashboard, null, 2)}
      </pre>
    </div>
  );
}

export default DashboardExample;
