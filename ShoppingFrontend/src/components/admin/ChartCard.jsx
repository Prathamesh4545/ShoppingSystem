import React, { memo } from "react";
import { motion } from "framer-motion";

const ChartCard = memo(({ title, ChartComponent, data }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
  };

  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-lg hover:scale-[1.02] transition-transform h-full"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
      <div className="h-64">
        <ChartComponent data={data} options={chartOptions} />
      </div>
    </motion.div>
  );
});

export default ChartCard;