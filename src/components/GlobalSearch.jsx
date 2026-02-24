import { useState } from "react";
import { Search, X } from "lucide-react";

export const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim()) {
      const username = localStorage.getItem("username");
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const currentUser = users.find((u) => u.username === username);

      const certs = currentUser?.certifications || [];
      const matchedCerts = certs.filter(
        (c) =>
          c.name.toLowerCase().includes(value.toLowerCase()) ||
          c.organization
            .toLowerCase()
            .includes(value.toLowerCase())
      );

      setResults(matchedCerts);
    } else {
      setResults([]);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
        title="Search (Ctrl+K)"
      >
        <Search size={18} />
        <span className="text-sm hidden md:inline">Search...</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/20 rounded-2xl w-96 max-w-full">
            <div className="flex items-center px-4 py-3 border-b border-white/10">
              <Search size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search certifications..."
                value={query}
                onChange={handleSearch}
                autoFocus
                className="flex-1 ml-3 bg-transparent outline-none text-white placeholder-gray-400"
              />
              <button
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                  setResults([]);
                }}
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {results.length > 0 ? (
                results.map((cert) => (
                  <div
                    key={cert.id}
                    className="px-4 py-3 border-b border-white/10 hover:bg-white/5 cursor-pointer"
                  >
                    <p className="font-semibold text-white">
                      {cert.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {cert.organization}
                    </p>
                    <p className="text-xs text-gray-500">
                      Expires: {cert.expiryDate}
                    </p>
                  </div>
                ))
              ) : query ? (
                <div className="px-4 py-6 text-center text-gray-400">
                  No certifications found
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-gray-400">
                  Start typing to search
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
