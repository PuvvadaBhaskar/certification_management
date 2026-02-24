import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

function ManageCertifications() {
  const [users, setUsers] = useState([]);
  const [showExpired, setShowExpired] =
    useState(false);

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("users")) || [];
    setUsers(stored);
  }, []);

  const updateStatus = (username, certId, status) => {
    const updated = users.map((u) => {
      if (u.username === username) {
        return {
          ...u,
          certifications: u.certifications.map((c) =>
            c.id === certId ? { ...c, status } : c
          ),
        };
      }
      return u;
    });

    localStorage.setItem("users", JSON.stringify(updated));
    setUsers(updated);
  };

  const deleteCertificate = (username, certId) => {
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
    setUsers(updated);
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

      {users.map((user) =>
        user.certifications
          ?.filter((cert) =>
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
                {user.username})
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
                      user.username,
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
                      user.username,
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
                      user.username,
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