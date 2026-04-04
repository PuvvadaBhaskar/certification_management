import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { Loader, AlertCircle, CheckCircle } from "lucide-react";
import { addCertification } from "../api/certification";

function AddCertification() {
  const [formData, setFormData] = useState({
    title: "",
    organization: "",
    issueDate: "",
    expiryDate: "",
    status: "ACTIVE",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [certificateFile, setCertificateFile] = useState(null);
  const navigate = useNavigate();

  const resolveUserId = () => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const parsedId = parsedUser?.id ?? parsedUser?.userId;
        if (parsedId !== undefined && parsedId !== null && `${parsedId}`.trim() !== "") {
          return String(parsedId);
        }
      } catch {
        // Ignore malformed JSON and fallback to legacy key.
      }
    }

    const legacyUserId = localStorage.getItem("userId");
    if (legacyUserId && legacyUserId !== "null" && legacyUserId !== "undefined") {
      return legacyUserId;
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const resolvedUserId = resolveUserId();

    if (!resolvedUserId) {
      alert("User not logged in");
      setError("Session expired. Please log in again.");
      return;
    }

    // Validation
    if (!formData.title || !formData.organization || !formData.issueDate) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.issueDate && formData.expiryDate) {
      if (new Date(formData.issueDate) >= new Date(formData.expiryDate)) {
        setError("Expiry date must be after issue date");
        return;
      }
    }

    if (certificateFile) {
      if (certificateFile.type !== "application/pdf") {
        setError("Only PDF files are allowed");
        return;
      }

      const maxFileSize = 10 * 1024 * 1024;
      if (certificateFile.size > maxFileSize) {
        setError("PDF size must be less than 10MB");
        return;
      }
    } else {
      setError("Please upload a certificate PDF");
      return;
    }

    try {
      setLoading(true);
      const payload = new FormData();
      payload.append("title", formData.title.trim());
      payload.append("organization", formData.organization.trim());
      payload.append("issueDate", formData.issueDate);

      if (formData.expiryDate) {
        payload.append("expiryDate", formData.expiryDate);
      }

      payload.append("status", formData.status);
      payload.append("userId", resolvedUserId);
      payload.append("file", certificateFile);

      await addCertification(payload);

      setSuccess(true);
      setFormData({
        title: "",
        organization: "",
        issueDate: "",
        expiryDate: "",
        status: "ACTIVE",
      });
      setCertificateFile(null);

      setTimeout(() => {
        navigate("/user/certifications");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add certification");
      console.error("Error adding certification:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Add New Certification</h1>

        <div className="bg-white/5 backdrop-blur-lg p-8 rounded-xl border border-white/10">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-500">
                Certification added successfully! Redirecting...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Certification Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., AWS Certified Solutions Architect"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Organization *
              </label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="e.g., Amazon Web Services"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Issue Date
              </label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Expiry Date *
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="EXPIRING_SOON">Expiring Soon</option>
              </select>
            </div>

            {/* Certificate PDF */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Certificate PDF (Optional)
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0] || null;
                  setCertificateFile(selectedFile);
                }}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-white focus:outline-none focus:border-blue-500"
              />
              <p className="mt-2 text-xs text-gray-400">
                Upload a PDF up to 10MB (required).
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading && <Loader className="w-5 h-5 animate-spin" />}
                {loading ? "Adding..." : "Add Certification"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/user/certifications")}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AddCertification;