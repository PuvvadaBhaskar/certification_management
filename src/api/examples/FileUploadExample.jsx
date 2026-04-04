import { useState } from "react";
import { uploadFile } from "../file";

function FileUploadExample() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a file first");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await uploadFile(file);
      setResponse(data);
    } catch (err) {
      setError(err?.response?.data?.message || "File upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        onChange={(event) => setFile(event.target.files?.[0] || null)}
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="rounded bg-green-600 px-4 py-2 text-white"
      >
        {loading ? "Uploading..." : "Upload File"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {response && (
        <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-sm">
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default FileUploadExample;
