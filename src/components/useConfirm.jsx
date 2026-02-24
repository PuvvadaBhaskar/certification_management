import { useState } from "react";

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState(null);

  const confirm = (msg, callback) => {
    setMessage(msg);
    setOnConfirm(() => callback);
    setIsOpen(true);
  };

  const ConfirmDialog = () => (
    isOpen && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-gray-900 border border-white/20 rounded-2xl p-8 max-w-sm">
          <p className="text-white mb-6">{message}</p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                onConfirm();
                setIsOpen(false);
              }}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              Confirm
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  );

  return { confirm, ConfirmDialog };
};
