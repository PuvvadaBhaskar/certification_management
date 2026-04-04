import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  getCertificationById,
  updateCertification,
} from "../apis/certificationService";

function RenewCertification() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [newDate, setNewDate] = useState("");
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const loadCertification = async () => {
      try {
        if (!userId) {
          navigate("/");
          return;
        }

        setLoading(true);
        const response = await getCertificationById(id, userId);
        const payload = response?.data;

        if (Array.isArray(payload)) {
          const matched = payload.find((c) => String(c.id) === String(id));
          setCert(matched || null);
        } else {
          setCert(payload || null);
        }
      } catch {
        setCert(null);
      } finally {
        setLoading(false);
      }
    };

    loadCertification();
  }, [id, userId, navigate]);

  useEffect(() => {
    if (!loading && !cert) {
      navigate("/user/certifications");
    }
  }, [cert, loading, navigate]);

  const handleRenew = async () => {
    if (!newDate) {
      alert("Please select new expiry date");
      return;
    }

    try {
      await updateCertification(id, {
        renewalRequest: true,
        newExpiryDate: newDate,
        renewalNotes: notes,
        newFileName: file?.name || null,
      });

      alert(
        "Renewal request sent to Admin for approval 👑"
      );

      navigate("/user/certifications");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to send renewal request");
    }
  };

  if (loading || !cert) return null;

  const expired =
    new Date(cert.expiryDate) <= new Date();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Renew Certification
        </h1>

        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-xl">

          {/* Certificate Name */}
          <div className="mb-6">
            <label className="block mb-2">
              Certification
            </label>
            <input
              value={cert.title || cert.name || ""}
              disabled
              className="w-full p-3 rounded bg-black/30"
            />
          </div>

          {/* Org + Old Expiry */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block mb-2">
                Organization
              </label>
              <input
                value={cert.organization}
                disabled
                className="w-full p-3 rounded bg-black/30"
              />
            </div>

            <div>
              <label className="block mb-2">
                Old Expiry Date
              </label>

              <div className="flex items-center gap-3">
                <input
                  value={cert.expiryDate}
                  disabled
                  className="w-full p-3 rounded bg-black/30"
                />

                <span
                  className={`px-3 py-1 rounded-full ${
                    expired
                      ? "bg-red-600"
                      : "bg-green-600"
                  }`}
                >
                  {expired
                    ? "Expired"
                    : "Active"}
                </span>
              </div>
            </div>
          </div>

          {/* New Expiry */}
          <div className="mb-6">
            <label className="block mb-2">
              New Expiry Date
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) =>
                setNewDate(e.target.value)
              }
              className="w-full p-3 rounded bg-black/30"
            />
          </div>

          {/* Upload PDF */}
          <div className="mb-6">
            <label className="block mb-2">
              Upload New Certificate (PDF)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                setFile(e.target.files[0])
              }
              className="w-full p-3 rounded bg-black/30"
            />
          </div>

          {/* Notes */}
          <div className="mb-8">
            <label className="block mb-2">
              Notes (Optional)
            </label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              className="w-full p-3 rounded bg-black/30"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleRenew}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-xl hover:scale-105 transition"
          >
            Send Renewal Request
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default RenewCertification;