import React, { memo } from "react";
import { motion } from "framer-motion";
import { ThemeContext } from "../../context/ThemeContext";
import { useContext } from "react";

const userStats = [
  { id: 1, title: "Total Users", value: 1200, description: "All-time users" },
  { id: 2, title: "Active Users", value: 800, description: "Currently active" },
  { id: 3, title: "New Users", value: 50, description: "This month" },
];

const UserStats = memo(() => {
  const { isDark } = useContext(ThemeContext);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pt-20">
      {userStats.map(({ id, title, value, description }) => (
        <motion.div
          key={id}
          className={`p-6 rounded-lg shadow-lg border-l-4 border-indigo-500 hover:shadow-xl transition-all ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3
            className={`text-lg font-bold mb-2 ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            {value}
          </p>
          <p
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {description}
          </p>
        </motion.div>
      ))}
    </div>
  );
});

export default UserStats;
