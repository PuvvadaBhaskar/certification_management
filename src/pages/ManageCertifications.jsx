import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getAllUsers } from "../api/user";
import {
  deleteCertification,
  getCertificationsByUser,
  updateCertification,
} from "../api/certification";

function ManageCertifications() {
  const [certifications, setCertifications] = useState([]);
  const [showExpired, setShowExpired] =
    useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCertifications();
  }, []);

  const loadCertifications = async () => {
    try {
      setLoading(true);
      const users = await getAllUsers();
      const usersArray = Array.isArray(users) ? users : [];

      const certCollections = await Promise.all(
        usersArray.map(async (user, index) => {
          if (user?.id === undefined || user?.id === null) {
            return [];
          }

          try {
            const certs = await getCertificationsByUser(user.id);
            const certsArray = Array.isArray(certs) ? certs : [];

            return certsArray.map((cert) => ({
              ...cert,
              username:
                user.username ||
                user.name ||
                user.email ||
                `user-${index + 1}`,
              userId: user.id,
            }));
          } catch {
            return [];
          }
        })
      );

      setCertifications(certCollections.flat());
    } catch (error) {
      console.error("Failed to load certifications:", error);
      alert(error?.response?.data?.message || "Failed to load certifications from backend");
      setCertifications([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (certId, status) => {
    try {
      await updateCertification(certId, { status });
      setCertifications((prev) =>
        prev.map((c) =>
          c.id === certId ? { ...c, status } : c
        )
      );
    } catch (error) {
      console.error("Failed to update certification:", error);
      alert(error?.response?.data?.message || "Failed to update certification status");
    }
  };

  const deleteCertificate = async (certId) => {
    if (!window.confirm("Delete this certification?")) {
      return;
    }

    try {
      await deleteCertification(certId);
      setCertifications((prev) => prev.filter((c) => c.id !== certId));
    } catch (error) {
      console.error("Failed to delete certification:", error);
      alert(error?.response?.data?.message || "Failed to delete certification");
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        Manage Certifications 📜
      </h1>

      <label className="block mb-6">
        <input
          type="checkbox"
          onChange={() =>
            setShowExpired(!showExpired)
          }
        />{" "}
        Show Expired Only
      </label>

      {loading ? (
        <div className="bg-white/10 p-5 rounded-xl">
          Loading certifications from backend...
        </div>
      ) : (
        certifications
          .filter((cert) =>
            showExpired
              ? new Date(cert.expiryDate) <
                new Date()
              : true
          )
          .map((cert) => (
            <div
              key={cert.id}
              className="bg-white/10 p-5 rounded-xl mb-4"
            >
              <p>
                <strong>{cert.name}</strong> (
                {cert.username})
              </p>
              <p>
                Org: {cert.organization}
              </p>
              <p>
                Expiry: {cert.expiryDate}
              </p>
              <p>Status: {cert.status}</p>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() =>
                    updateStatus(
                      cert.id,
                      "Approved"
                    )
                  }
                  className="bg-green-600 px-3 py-1 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() =>
                    updateStatus(
                      cert.id,
                      "Rejected"
                    )
                  }
                  className="bg-yellow-600 px-3 py-1 rounded"
                >
                  Reject
                </button>

                <button
                  onClick={() =>
                    deleteCertificate(
                      cert.id
                    )
                  }
                  className="bg-red-600 px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
      )}
    </DashboardLayout>
  );
}

export default ManageCertifications;