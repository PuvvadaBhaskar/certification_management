import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { Search, Download, Trash2, RotateCw } from "lucide-react";
import { generatePDF } from "../utils/pdfExport";
import { logActivity } from "../utils/auditLog";

function MyCertifications() {
  const [certs, setCerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [selectedCerts, setSelectedCerts] = useState(new Set());
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCertForCategory, setSelectedCertForCategory] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const navigate = useNavigate();

  const loadData = () => {
    const username = localStorage.getItem("username");
    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const currentUser = users.find(
      (u) => u.username === username
    );

    setCerts(currentUser?.certifications || []);
  };

  useEffect(() => {
    const username = localStorage.getItem("username");
    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const currentUser = users.find(
      (u) => u.username === username
    );

    if (currentUser?.certifications) {
      // eslint-disable-next-line
      setCerts(currentUser.certifications);
    }
  }, []);

  const deleteCert = (id) => {
    if (!window.confirm("Are you sure you want to delete this certification?")) return;

    const username = localStorage.getItem("username");
    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const cert = certs.find((c) => c.id === id);

    const updated = users.map((u) => {
      if (u.username === username) {
        return {
          ...u,
          certifications: u.certifications.filter(
            (c) => c.id !== id
          ),
        };
      }
      return u;
    });

    localStorage.setItem("users", JSON.stringify(updated));
    logActivity(username, "delete_certificate", `Deleted ${cert.name}`);
    loadData();
  };

  const bulkDeleteCerts = () => {
    if (!window.confirm(
      `Delete ${selectedCerts.size} certifications? This action cannot be undone.`
    ))
      return;

    const username = localStorage.getItem("username");
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const updated = users.map((u) => {
      if (u.username === username) {
        return {
          ...u,
          certifications: u.certifications.filter(
            (c) => !selectedCerts.has(c.id)
          ),
        };
      }
      return u;
    });

    localStorage.setItem("users", JSON.stringify(updated));
    logActivity(
      username,
      "bulk_delete_certificates",
      `Deleted ${selectedCerts.size} certifications`
    );
    setSelectedCerts(new Set());
    loadData();
  };

  const setCertCategory = (certId, category) => {
    const username = localStorage.getItem("username");
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const updated = users.map((u) => {
      if (u.username === username) {
        return {
          ...u,
          certifications: u.certifications.map((c) =>
            c.id === certId ? { ...c, category: category || "Other" } : c
          ),
        };
      }
      return u;
    });

    localStorage.setItem("users", JSON.stringify(updated));
    logActivity(
      username,
      "categorize_certificate",
      `Categorized cert as ${category}`
    );
    setShowCategoryModal(false);
    loadData();
  };

  const getFilteredAndSortedCerts = () => {
    let filtered = certs.filter((cert) => {
      const matchesSearch =
        cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.organization.toLowerCase().includes(searchTerm.toLowerCase());
      const isExpired = new Date(cert.expiryDate) <= new Date();
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !isExpired) ||
        (statusFilter === "expired" && isExpired);
      const matchesCategory =
        categoryFilter === "all" || cert.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "date-desc")
        return new Date(b.expiryDate) - new Date(a.expiryDate);
      if (sortBy === "date-asc")
        return new Date(a.expiryDate) - new Date(b.expiryDate);
      if (sortBy === "name")
        return a.name.localeCompare(b.name);
      return 0;
    });

    return filtered;
  };

  const getUniqueCategories = () => {
    const cats = new Set(
      certs
        .filter((c) => c.category)
        .map((c) => c.category)
    );
    return Array.from(cats);
  };

  const toggleSelectCert = (id) => {
    const newSelected = new Set(selectedCerts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCerts(newSelected);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">
          My Certifications 📜
        </h1>

        {/* Search and Filters */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-white/10">
          {/* Search Bar */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 flex items-center bg-white/5 rounded-lg px-4 border border-white/10">
              <Search size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 ml-3 bg-transparent outline-none text-white placeholder-gray-400 py-2"
              />
            </div>
            <button
              onClick={() => generatePDF(getFilteredAndSortedCerts())}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2"
            >
              <Download size={18} />
              Export
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="expired">Expired Only</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white cursor-pointer"
            >
              <option value="all">All Categories</option>
              {getUniqueCategories().map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name">Name (A-Z)</option>
            </select>

            {/* Bulk Actions */}
            {selectedCerts.size > 0 && (
              <div className="flex gap-2 ml-auto">
                <span className="text-sm text-gray-400 flex items-center">
                  {selectedCerts.size} selected
                </span>
                <button
                  onClick={bulkDeleteCerts}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>

        {getFilteredAndSortedCerts().length === 0 && (
          <div className="bg-white/10 p-6 rounded-2xl text-center">
            No certifications added yet.
          </div>
        )}

        {getFilteredAndSortedCerts().length > 0 && (
          <div className="space-y-4">
            {getFilteredAndSortedCerts().map((cert) => {
              const expired =
                new Date(cert.expiryDate) <= new Date();
              const isSelected = selectedCerts.has(cert.id);

              return (
                <div
                  key={cert.id}
                  className={`bg-white/10 backdrop-blur-xl p-6 rounded-3xl transition duration-300 border-2 ${
                    isSelected
                      ? "border-blue-500 scale-98"
                      : "border-white/10 hover:border-blue-500"
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectCert(cert.id)}
                      className="w-5 h-5 mt-2 cursor-pointer"
                    />

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h2 className="text-xl font-semibold">
                            {cert.name}
                          </h2>
                          <p className="text-gray-300">
                            {cert.organization}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              expired
                                ? "bg-red-600"
                                : "bg-green-600"
                            }`}
                          >
                            {expired ? "Expired" : "Active"}
                          </span>
                          {cert.category && (
                            <span className="px-3 py-1 rounded-full text-sm bg-purple-600">
                              {cert.category}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-300 mb-4">
                        Expiry Date:{" "}
                        <span className="font-medium">
                          {cert.expiryDate}
                        </span>
                      </p>

                      {cert.file && (
                        <a
                          href={cert.file.data}
                          download={cert.file.name}
                          className="text-blue-400 underline block mb-4"
                        >
                          Download Certificate
                        </a>
                      )}

                      <div className="flex gap-3 flex-wrap">
                        <button
                          onClick={() =>
                            navigate(`/renew/${cert.id}`)
                          }
                          className="bg-blue-600 px-4 py-2 rounded-xl hover:scale-105 transition flex items-center gap-2"
                        >
                          <RotateCw size={16} />
                          Renew
                        </button>

                        <button
                          onClick={() =>
                            navigate(`/edit/${cert.id}`)
                          }
                          className="bg-yellow-500 px-4 py-2 rounded-xl hover:scale-105 transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => {
                            setSelectedCertForCategory(cert);
                            setShowCategoryModal(true);
                          }}
                          className="bg-purple-600 px-4 py-2 rounded-xl hover:scale-105 transition"
                        >
                          Category
                        </button>

                        <button
                          onClick={() =>
                            deleteCert(cert.id)
                          }
                          className="bg-red-600 px-4 py-2 rounded-xl hover:scale-105 transition flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Category Modal */}
        {showCategoryModal && selectedCertForCategory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gray-900 border border-white/20 rounded-2xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6">
                Categorize Certificate
              </h2>
              <div className="space-y-3 mb-6">
                {[
                  "IT",
                  "Software",
                  "Cloud",
                  "Security",
                  "Data Science",
                  "Networking",
                  "Other",
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setCertCategory(
                        selectedCertForCategory.id,
                        cat
                      )
                    }
                    className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg transition text-left"
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Custom category..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg outline-none text-white placeholder-gray-400"
                />
                <button
                  onClick={() => {
                    if (newCategory.trim()) {
                      setCertCategory(
                        selectedCertForCategory.id,
                        newCategory
                      );
                      setNewCategory("");
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  Add
                </button>
              </div>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setNewCategory("");
                }}
                className="w-full mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default MyCertifications;