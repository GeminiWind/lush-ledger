"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 2600,
        style: {
          borderRadius: "12px",
          background: "#1b3641",
          color: "#eaffe2",
          border: "1px solid #2e7d32",
          fontWeight: 600,
        },
      }}
    />
  );
}
