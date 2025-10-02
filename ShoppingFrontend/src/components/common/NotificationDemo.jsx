import React from "react";
import { toast } from "react-toastify";

const NotificationDemo = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Notification Demo</h2>
      <div className="space-x-2">
        <button onClick={() => toast.success("Success!")} className="bg-green-500 text-white px-4 py-2 rounded">Success</button>
        <button onClick={() => toast.error("Error!")} className="bg-red-500 text-white px-4 py-2 rounded">Error</button>
        <button onClick={() => toast.info("Info!")} className="bg-blue-500 text-white px-4 py-2 rounded">Info</button>
        <button onClick={() => toast.warning("Warning!")} className="bg-yellow-500 text-white px-4 py-2 rounded">Warning</button>
      </div>
    </div>
  );
};

export default NotificationDemo;
