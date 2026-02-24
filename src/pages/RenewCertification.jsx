import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

function RenewCertification() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cert, setCert] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const username = localStorage.getItem("username");
    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const currentUser = users.find(
      (u) => u.username === username
    );

    const certificate =
      currentUser?.certifications.find(
        (c) => c.id === id
      );

    if (!certificate) {
      navigate("/user/certifications");
      return;
    }

    setCert(certificate);
  }, [id, navigate]);

  const handleRenew = () => {
    if (!newDate) {
      alert("Please select new expiry date");
      return;
    }

    const username = localStorage.getItem("username");
    const users =
      JSON.parse(localStorage.getItem("users")) || [];

    const updated = users.map((u) => {
      if (u.username === username) {
        return {
          ...u,
          certifications: u.certifications.map((c) =>
            c.id === id
              ? {
                  ...c,
                  renewalRequest: true,
                  newExpiryDate: newDate,
                  newFile: file
                    ? {
                        name: file.name,
                        data:
                          URL.createObjectURL(file),
                      }
                    : null,
                  renewalNotes: notes,
                }
              : c
          ),
        };
      }
      return u;
    });

    localStorage.setItem(
      "users",
      JSON.stringify(updated)
    );

    alert(
      "Renewal request sent to Admin for approval 👑"
    );

    navigate("/user/certifications");
  };

  if (!cert) return null;

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
              value={cert.name}
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