import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

function EditCertification({ certifications, updateCertification }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const existingCert = certifications.find(
    (cert) => cert.id === Number(id)
  );

  const [formData, setFormData] = useState(existingCert);

  useEffect(() => {
    if (!existingCert) {
      navigate("/user/certifications");
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateCertification(formData);
    navigate("/user/certifications");
  };

  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold mb-10 text-white">
        Edit Certification ✏️
      </h1>

      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            type="text"
            name="name"
            value={formData?.name || ""}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-3"
          />

          <input
            type="text"
            name="organization"
            value={formData?.organization || ""}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-3"
          />

          <input
            type="date"
            name="issueDate"
            value={formData?.issueDate || ""}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-3"
          />

          <input
            type="date"
            name="expiryDate"
            value={formData?.expiryDate || ""}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-3"
          />

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-xl transition"
          >
            Update Certification 🚀
          </button>

        </form>
      </div>
    </DashboardLayout>
  );
}

export default EditCertification;