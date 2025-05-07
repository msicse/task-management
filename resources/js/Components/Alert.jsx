import { useEffect, useState } from "react";
import { FaSpinner, FaTimes } from "react-icons/fa";

export default function Alert({ message, type = "success", onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Only auto-dismiss non-loading alerts
    if (type !== 'loading') {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [onClose, type]);

  if (!isVisible) return null;

  const styles = {
    success: "bg-green-100 border-green-400 text-green-700",
    error: "bg-red-100 border-red-400 text-red-700",
    warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
    info: "bg-blue-100 border-blue-400 text-blue-700",
    loading: "bg-gray-100 border-gray-400 text-gray-700",
  };

  return (
    <div className={`mb-4 border px-4 py-3 rounded relative ${styles[type]}`} role="alert">
      <div className="flex items-center">
        {type === 'loading' && (
          <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" />
        )}
        <span className="block sm:inline">{message}</span>
      </div>
      {type !== 'loading' && (
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
        >
          <FaTimes className="fill-current h-6 w-6" aria-label="Close" />
        </button>
      )}
    </div>
  );
}
