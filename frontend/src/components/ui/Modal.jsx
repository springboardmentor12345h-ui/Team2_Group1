import React, { useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-4xl",
}) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`relative w-full ${maxWidth} bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-in zoom-in-95 duration-300`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors text-white hover:text-white sm:text-secondary-500 sm:bg-transparent"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="max-h-[85vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
