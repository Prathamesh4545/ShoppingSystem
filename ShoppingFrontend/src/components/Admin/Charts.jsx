import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

// Common options for both charts
const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                    size: 12
                }
            }
        }
    }
};

// Line chart specific options
const lineOptions = {
    ...commonOptions,
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                drawBorder: false,
                color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
                padding: 10
            }
        },
        x: {
            grid: {
                display: false
            },
            ticks: {
                padding: 10
            }
        }
    },
    plugins: {
        ...commonOptions.plugins,
        tooltip: {
            mode: 'index',
            intersect: false,
            padding: 12,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
                size: 14
            },
            bodyFont: {
                size: 13
            }
        }
    },
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
    }
};

// Pie chart specific options
const pieOptions = {
    ...commonOptions,
    plugins: {
        ...commonOptions.plugins,
        tooltip: {
            padding: 12,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
                size: 14
            },
            bodyFont: {
                size: 13
            }
        }
    }
};

export function LineChart({ data }) {
    return (
        <div className="h-[300px]">
            <Line data={data} options={lineOptions} />
        </div>
    );
}

export function PieChart({ data }) {
    return (
        <div className="h-[300px]">
            <Pie data={data} options={pieOptions} />
        </div>
    );
} 