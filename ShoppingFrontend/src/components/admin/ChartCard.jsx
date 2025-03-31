import React, { memo } from "react";
import { motion } from "framer-motion";
import { useContext } from "react";
import ThemeContext from "../../context/ThemeContext";

const ChartCard = memo(({ title, ChartComponent, data, gradient }) => {
  const { isDark } = useContext(ThemeContext);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 20,
          color: isDark ? "#e5e7eb" : "#4b5563",
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: "500",
          },
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 6,
        },
      },
      tooltip: {
        backgroundColor: isDark ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.8)",
        titleColor: isDark ? "#e5e7eb" : "#111827",
        bodyColor: isDark ? "#e5e7eb" : "#4b5563",
        padding: 12,
        borderColor: isDark ? "rgba(75, 85, 99, 0.2)" : "rgba(229, 231, 235, 0.8)",
        borderWidth: 1,
        displayColors: true,
        boxPadding: 4,
        titleFont: {
          size: 14,
          weight: "600",
          family: "'Inter', sans-serif",
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif",
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: isDark ? "#9ca3af" : "#6b7280",
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          padding: 8,
        },
      },
      y: {
        grid: {
          color: isDark ? "rgba(75, 85, 99, 0.1)" : "rgba(243, 244, 246, 0.8)",
          drawBorder: false,
        },
        ticks: {
          color: isDark ? "#9ca3af" : "#6b7280",
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
          padding: 8,
          callback: function(value) {
            return new Intl.NumberFormat('en-US', { 
              style: 'currency', 
              currency: 'INR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          }
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <motion.div
      className={`p-6 rounded-2xl shadow-lg backdrop-blur-sm 
        ${isDark ? "bg-gray-800/50" : "bg-white"} 
        hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
      
      {/* Content */}
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
            {title}
          </h3>
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`} />
        </div>
        <div className="h-[300px] relative">
          {data ? (
            <ChartComponent
              data={data}
              options={{
                ...chartOptions,
                ...(data.datasets[0].type === 'doughnut' && {
                  cutout: '70%',
                  radius: '90%',
                }),
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                No data available
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default ChartCard;
