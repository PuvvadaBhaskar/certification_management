import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { Loader, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import {
  getCertificationById,
  updateCertification,
} from "../apis/certificationService";

function EditCertification() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    organization: "",
    issueDate: "",
    expiryDate: "",
    status: "ACTIVE",
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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

  const fetchCertification = useCallback(async () => {
    try {
      if (!userId) {
        navigate("/");
        return;
      }

      setLoading(true);
      const response = await getCertificationById(id, userId);

      const payload = response?.data ?? [];
      const certifications = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.content)
          ? payload.content
          : payload;
      const cert = Array.isArray(certifications)
        ? certifications.find((c) => c.id === parseInt(id))
        : certifications;

      if (cert) {
        setFormData({
          title: cert.title || "",
          organization: cert.organization || "",
          issueDate: cert.issueDate || "",
          expiryDate: cert.expiryDate || "",
          status: cert.status || "ACTIVE",
        });
      } else {
        setError("Certification not found");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch certification");
      console.error("Error fetching certification:", err);
    } finally {
      setLoading(false);
    }
  }, [id, userId, navigate]);

  useEffect(() => {
    fetchCertification();
  }, [fetchCertification]);

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

    if (!formData.title || !formData.organization || !formData.expiryDate) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.issueDate && formData.expiryDate) {
      if (new Date(formData.issueDate) >= new Date(formData.expiryDate)) {
        setError("Expiry date must be after issue date");
        return;
      }
    }

    try {
      setUpdating(true);
      await updateCertification(parseInt(id), formData);
      setSuccess(true);
      setTimeout(() => {
        navigate("/user/certifications");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update certification");
      console.error("Error updating certification:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-gray-400">Loading certification...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/user/certifications")}
          className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Certifications
        </button>

        <h1 className="text-4xl font-bold mb-8">Edit Certification</h1>

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
                Certification updated successfully! Redirecting...
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

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={updating}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
              >
                {updating && <Loader className="w-5 h-5 animate-spin" />}
                {updating ? "Updating..." : "Update Certification"}
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

export default EditCertification;