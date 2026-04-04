import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { Edit, Trash2, RotateCw, Loader, AlertCircle } from "lucide-react";
import { getCertifications, deleteCertification } from "../apis/certificationService";

function MyCertifications() {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  const itemsPerPage = 5;
  const getUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (user?.id !== undefined && user?.id !== null) {
        return String(user.id);
      }
    } catch {
      // Ignore malformed user JSON.
    }

    const fallbackId = localStorage.getItem("userId");
    if (fallbackId && fallbackId !== "null" && fallbackId !== "undefined") {
      return fallbackId;
    }

    return null;
  };

  const userId = getUserId();

  const fetchCertifications = useCallback(async () => {
    try {
      if (!userId) {
        navigate("/");
        setError("Session expired. Please log in again.");
        setCertifications([]);
        setTotalPages(1);
        return;
      }

      setLoading(true);
      setError(null);

      const params = {
        userId,
        page: currentPage - 1,
        size: itemsPerPage,
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      };

      // Remove undefined values
      Object.keys(params).forEach(
        (key) => params[key] === undefined && delete params[key]
      );

      const response = await getCertifications(params);
      const payload = response?.data ?? [];
      const content = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.content)
          ? payload.content
          : Array.isArray(payload.items)
            ? payload.items
            : [];

      const pages =
        Number(payload.totalPages ?? payload.page?.totalPages ?? 1) || 1;

      setCertifications(content);
      setTotalPages(Math.max(1, pages));
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch certifications"
      );
      console.error("Error fetching certifications:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, userId, itemsPerPage, navigate]);

  useEffect(() => {
    fetchCertifications();
  }, [fetchCertifications]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this certification?")) {
      return;
    }

    try {
      setDeleting(id);
      await deleteCertification(id);
      await fetchCertifications();
      alert("Certification deleted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete certification");
      console.error("Error deleting certification:", err);
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-certification/${id}`);
  };

  const handleRenew = (id) => {
    navigate(`/renew/${id}`);
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "text-green-500 bg-green-500/10";
      case "EXPIRED":
        return "text-red-500 bg-red-500/10";
      case "EXPIRING_SOON":
        return "text-yellow-500 bg-yellow-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && certifications.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-gray-400">Loading certifications...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My Certifications</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white/5 backdrop-blur-lg p-6 rounded-xl mb-6 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search by Title
              </label>
              <input
                type="text"
                placeholder="Search certifications..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="EXPIRING_SOON">Expiring Soon</option>
              </select>
            </div>

            {/* Add New Button */}
            <div className="flex items-end">
              <button
                onClick={() => navigate("/add-certification")}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
              >
                + Add Certification
              </button>
            </div>
          </div>
        </div>

        {/* Certifications Table */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10">
          {certifications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-lg">No certifications found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Organization
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Expiry Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {certifications.map((cert) => (
                      <tr
                        key={cert.id}
                        className="border-b border-white/10 hover:bg-white/5 transition"
                      >
                        <td className="px-6 py-4 text-white font-medium">
                          {cert.title}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {cert.organization}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(cert.status)}`}
                          >
                            {cert.status || "PENDING"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {formatDate(cert.expiryDate)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleEdit(cert.id)}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRenew(cert.id)}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition"
                              title="Renew"
                            >
                              <RotateCw className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(cert.id)}
                              disabled={deleting === cert.id}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
                              title="Delete"
                            >
                              {deleting === cert.id ? (
                                <Loader className="w-5 h-5 animate-spin" />
                              ) : (
                                <Trash2 className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MyCertifications;