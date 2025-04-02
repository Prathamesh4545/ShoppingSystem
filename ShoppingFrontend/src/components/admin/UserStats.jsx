import React from 'react';
import { FaUsers, FaUserCheck, FaShoppingCart, FaRupeeSign, FaUserPlus, FaBox } from 'react-icons/fa';
import { motion } from 'framer-motion';

const statsConfig = [
    {
        key: 'totalUsers',
        label: 'Total Users',
        icon: FaUsers,
        gradient: 'from-blue-500 to-indigo-600',
        formatter: value => value.toLocaleString()
    },
    {
        key: 'activeUsers',
        label: 'Active Users',
        icon: FaUserCheck,
        gradient: 'from-green-500 to-emerald-600',
        formatter: value => value.toLocaleString()
    },
    {
        key: 'totalOrders',
        label: 'Total Orders',
        icon: FaShoppingCart,
        gradient: 'from-purple-500 to-pink-600',
        formatter: value => value.toLocaleString()
    },
    {
        key: 'totalRevenue',
        label: 'Total Revenue',
        icon: FaRupeeSign,
        gradient: 'from-yellow-500 to-orange-600',
        formatter: value => `₹ ${value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`
    },
    {
        key: 'newUsers',
        label: 'New Users',
        icon: FaUserPlus,
        gradient: 'from-pink-500 to-rose-600',
        formatter: value => value.toLocaleString()
    },
    {
        key: 'totalProducts',
        label: 'Total Products',
        icon: FaBox,
        gradient: 'from-cyan-500 to-blue-600',
        formatter: value => value.toLocaleString()
    }
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function UserStats({ stats }) {
    return (
        <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {statsConfig.map(({ key, label, icon: Icon, gradient, formatter }) => (
                <motion.div
                    key={key}
                    variants={item}
                    className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
                    
                    {/* Content */}
                    <div className="relative">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {formatter(stats[key] || 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}
