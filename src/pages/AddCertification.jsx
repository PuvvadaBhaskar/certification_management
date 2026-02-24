import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";

function AddCertification() {
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleFile = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    if (selected.type !== "application/pdf") {
      alert("Only PDF files allowed!");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setFile({
        name: selected.name,
        data: reader.result,
      });
    };

    reader.readAsDataURL(selected);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !organization || !expiryDate || !file) {
      alert("Fill all fields + upload PDF");
      return;
    }

    const username = localStorage.getItem("username");
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const updatedUsers = users.map((u) => {
      if (u.username === username) {
        const newCert = {
          id: Date.now(),
          name,
          organization,
          expiryDate,
          file,
          status: "Pending",
        };

        const certifications = u.certifications || [];
        return {
          ...u,
          certifications: [...certifications, newCert],
        };
      }
      return u;
    });

    localStorage.setItem("users", JSON.stringify(updatedUsers));

    alert("Certificate Added!");
    navigate("/user/dashboard");
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">
        Add Certification 📜
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl w-[500px]"
      >
        <input
          type="text"
          placeholder="Certificate Name"
          className="w-full p-3 mb-4 rounded bg-black/40"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Organization"
          className="w-full p-3 mb-4 rounded bg-black/40"
          onChange={(e) => setOrganization(e.target.value)}
        />

        <input
          type="date"
          className="w-full p-3 mb-4 rounded bg-black/40"
          onChange={(e) => setExpiryDate(e.target.value)}
        />

        {/* PDF Upload */}
        <label className="cursor-pointer block mb-4">
          <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            Upload Certificate (PDF)
          </span>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFile}
            className="hidden"
          />
        </label>

        {file && (
          <p className="text-green-400 mb-4">
            Selected: {file.name}
          </p>
        )}

        <button className="w-full bg-green-600 py-2 rounded">
          Add Certificate
        </button>
      </form>
    </DashboardLayout>
  );
}

export default AddCertification;