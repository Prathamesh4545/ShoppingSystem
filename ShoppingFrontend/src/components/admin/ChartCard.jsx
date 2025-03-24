import React, { memo } from "react";
import { motion } from "framer-motion";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

const ChartCard = memo(({ title, ChartComponent, data }) => {
  const { isDark } = useContext(ThemeContext);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
  };

  return (
    <motion.div
      className={`p-6 rounded-lg shadow-lg hover:scale-[1.02] transition-transform h-full ${
        isDark ? "bg-gray-800" : "bg-white"
      }`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3
        className={`text-xl font-bold mb-4 ${
          isDark ? "text-white" : "text-gray-800"
        }`}
      >
        {title}
      </h3>
      <div className="h-64">
        <ChartComponent
          data={data}
          options={{
            ...chartOptions,
            plugins: {
              legend: {
                labels: {
                  color: isDark ? "#fff" : "#666",
                },
              },
            },
            scales: {
              x: {
                ticks: { color: isDark ? "#fff" : "#666" },
                grid: {
                  color: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                },
              },
              y: {
                ticks: { color: isDark ? "#fff" : "#666" },
                grid: {
                  color: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                },
              },
            },
          }}
        />
      </div>
    </motion.div>
  );
});

export default ChartCard;
