import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { Search, Trash2, User, Download } from "lucide-react";
import { generatePDF } from "../utils/pdfExport";

function AdminCertificateManagement() {
  const [allCerts, setAllCerts] = useState([]);
  const [filteredCerts, setFilteredCerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [users, setUsers] = useState([]);

  const loadCertifications = () => {
    const stored = JSON.parse(localStorage.getItem("users")) || [];
    setUsers(stored);

    const certs = [];
    stored.forEach((user) => {
      user.certifications?.forEach((cert) => {
        certs.push({
          ...cert,
          username: user.username,
          userRole: user.role,
        });
      });
    });

    setAllCerts(certs);
  };

  const filterCertifications = () => {
    let filtered = allCerts;

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          c.organization
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          c.username
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => {
        const isExpired =
          new Date(c.expiryDate) <= new Date();
        if (statusFilter === "active")
          return !isExpired;
        if (statusFilter === "expired") return isExpired;
        return true;
      });
    }

    if (userFilter !== "all") {
      filtered = filtered.filter(
        (c) => c.username === userFilter
      );
    }

    setFilteredCerts(filtered);
  };

  const deleteCertificate = (username, certId) => {
    if (
      !window.confirm(
        "Delete this certification? This action cannot be undone."
      )
    )
      return;

    const updated = users.map((u) => {
      if (u.username === username) {
        return {
          ...u,
          certifications: u.certifications.filter(
            (c) => c.id !== certId
          ),
        };
      }
      return u;
    });

    localStorage.setItem("users", JSON.stringify(updated));
    loadCertifications();
  };

  useEffect(() => {
    loadCertifications();
  }, []);

  useEffect(() => {
    filterCertifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, userFilter, allCerts]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">
            Certificate Management 📜
          </h1>
          <button
            onClick={() =>
              generatePDF(
                filteredCerts,
                `admin-certs-${new Date().toISOString().split("T")[0]}.csv`
              )
            }
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2"
          >
            <Download size={18} />
            Export
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl mb-6 border border-white/10">
          <div className="flex gap-3 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-64 flex items-center bg-white/5 rounded-lg px-4 border border-white/10">
              <Search size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search by cert, org, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 ml-3 bg-transparent outline-none text-white placeholder-gray-400 py-2"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>

            {/* User Filter */}
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white cursor-pointer"
            >
              <option value="all">All Users</option>
              {users.map((u) => (
                <option key={u.username} value={u.username}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Certifications Table */}
        {filteredCerts.length > 0 ? (
          <div className="space-y-3">
            {filteredCerts.map((cert) => {
              const isExpired =
                new Date(cert.expiryDate) <= new Date();

              return (
                <div
                  key={`${cert.username}-${cert.id}`}
                  className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-white/20 transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold">
                          {cert.name}
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            isExpired
                              ? "bg-red-600"
                              : "bg-green-600"
                          }`}
                        >
                          {isExpired ? "EXPIRED" : "ACTIVE"}
                        </span>
                        {cert.category && (
                          <span className="px-3 py-1 text-xs rounded-full bg-purple-600">
                            {cert.category}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-3">
                        <div>
                          <p className="text-gray-500">
                            Organization
                          </p>
                          <p>{cert.organization}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">
                            Expires
                          </p>
                          <p>{cert.expiryDate}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <User size={16} />
                        <span>{cert.username}</span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        deleteCertificate(
                          cert.username,
                          cert.id
                        )
                      }
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/10 p-8 rounded-2xl text-center text-gray-400">
            <p>No certifications found</p>
          </div>
        )}

        {/* Summary */}
        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="bg-white/10 p-6 rounded-2xl text-center">
            <p className="text-gray-400 mb-2">Total</p>
            <p className="text-3xl font-bold text-blue-400">
              {filteredCerts.length}
            </p>
          </div>
          <div className="bg-white/10 p-6 rounded-2xl text-center">
            <p className="text-gray-400 mb-2">Active</p>
            <p className="text-3xl font-bold text-green-400">
              {
                filteredCerts.filter(
                  (c) =>
                    new Date(c.expiryDate) > new Date()
                ).length
              }
            </p>
          </div>
          <div className="bg-white/10 p-6 rounded-2xl text-center">
            <p className="text-gray-400 mb-2">Expired</p>
            <p className="text-3xl font-bold text-red-400">
              {
                filteredCerts.filter(
                  (c) =>
                    new Date(c.expiryDate) <= new Date()
                ).length
              }
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AdminCertificateManagement;
