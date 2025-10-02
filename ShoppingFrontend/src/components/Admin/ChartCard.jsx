import React, { memo } from "react";
import { motion } from "framer-motion";
import { useContext } from "react";
import ThemeContext from "../../context/ThemeContext";

const ChartCard = memo(({ title, ChartComponent, data, gradient, chartType = 'bar' }) => {
  const { isDark } = useContext(ThemeContext);

  const getChartOptions = () => {
    const baseOptions = {
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
      mode: chartType === 'doughnut' ? 'nearest' : 'index',
      intersect: chartType === 'doughnut',
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
  };

    if (chartType === 'doughnut') {
      return {
        ...baseOptions,
        cutout: '70%',
        plugins: {
          ...baseOptions.plugins,
          legend: {
            ...baseOptions.plugins.legend,
            position: 'right',
          },
          tooltip: {
            ...baseOptions.plugins.tooltip,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        scales: undefined,
      };
    }

    if (chartType === 'line') {
      return {
        ...baseOptions,
        scales: {
          ...baseOptions.scales,
          y: {
            ...baseOptions.scales.y,
            beginAtZero: true,
          }
        }
      };
    }

    return baseOptions;
  };

  const chartOptions = getChartOptions();

  return (
    <motion.div
      className={`relative p-8 rounded-2xl backdrop-blur-xl border transition-all duration-500 group overflow-hidden
        ${isDark 
          ? "bg-slate-800/40 border-slate-700/30 hover:bg-slate-800/60 hover:border-slate-600/50" 
          : "bg-white/60 border-slate-200/30 hover:bg-white/80 hover:border-slate-300/50"
        } 
        shadow-xl hover:shadow-2xl hover:-translate-y-1`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Animated Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
      
      {/* Floating Orbs */}
      <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
      <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-700 delay-100" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${gradient}`} />
            <h3 className={`text-xl font-bold tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${gradient} animate-pulse`} />
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient} opacity-60`} />
          </div>
        </div>
        
        <div className="h-[320px] relative">
          {data ? (
            <div className="relative h-full">
              <ChartComponent
                data={data}
                options={chartOptions}
              />
              {/* Chart overlay effects */}
              <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient} opacity-20 rounded-full`} />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${gradient} opacity-20 mb-4 animate-pulse`} />
              <div className={`text-base font-medium ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}>
                No data available
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${gradient} opacity-30 group-hover:opacity-60 transition-opacity duration-300`} />
    </motion.div>
  );
});

export default ChartCard;
