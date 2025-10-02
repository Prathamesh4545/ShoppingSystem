import React from 'react';
import { FaUsers, FaUserCheck, FaShoppingCart, FaRupeeSign, FaUserPlus, FaBox } from 'react-icons/fa';
import { motion } from 'framer-motion';

const statsConfig = [
    {
        key: 'totalUsers',
        label: 'Total Users',
        icon: FaUsers,
        gradient: 'from-blue-500 to-indigo-600',
        formatter: value => new Intl.NumberFormat('en-IN').format(value || 0)
    },
    {
        key: 'activeUsers',
        label: 'Active Users',
        icon: FaUserCheck,
        gradient: 'from-green-500 to-emerald-600',
        formatter: value => new Intl.NumberFormat('en-IN').format(value || 0)
    },
    {
        key: 'totalOrders',
        label: 'Total Orders',
        icon: FaShoppingCart,
        gradient: 'from-purple-500 to-pink-600',
        formatter: value => new Intl.NumberFormat('en-IN').format(value || 0)
    },
    {
        key: 'totalRevenue',
        label: 'Active Revenue',
        icon: FaRupeeSign,
        gradient: 'from-green-500 to-emerald-600',
        formatter: value => new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value || 0)
    },
    {
        key: 'cancelledRevenue',
        label: 'Cancelled Revenue',
        icon: FaRupeeSign,
        gradient: 'from-red-500 to-pink-600',
        formatter: value => new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value || 0)
    },
    {
        key: 'grossRevenue',
        label: 'Gross Revenue',
        icon: FaRupeeSign,
        gradient: 'from-yellow-500 to-orange-600',
        formatter: value => new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value || 0)
    },
    {
        key: 'newUsers',
        label: 'New Users',
        icon: FaUserPlus,
        gradient: 'from-pink-500 to-rose-600',
        formatter: value => new Intl.NumberFormat('en-IN').format(value || 0)
    },
    {
        key: 'totalProducts',
        label: 'Total Products',
        icon: FaBox,
        gradient: 'from-cyan-500 to-blue-600',
        formatter: value => new Intl.NumberFormat('en-IN').format(value || 0)
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
                    className="group relative overflow-hidden rounded-2xl backdrop-blur-xl border p-6 transition-all duration-500 hover:-translate-y-2 bg-white/60 dark:bg-slate-800/40 border-slate-200/30 dark:border-slate-700/30 hover:bg-white/80 dark:hover:bg-slate-800/60 hover:border-slate-300/50 dark:hover:border-slate-600/50 shadow-xl hover:shadow-2xl"
                    whileHover={{ scale: 1.03 }}
                >
                    {/* Animated Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
                    
                    {/* Floating Elements */}
                    <div className="absolute top-2 right-2 w-12 h-12 bg-gradient-to-r from-white/10 to-white/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="absolute bottom-2 left-2 w-8 h-8 bg-gradient-to-r from-white/10 to-white/5 rounded-full blur-lg group-hover:scale-125 transition-transform duration-700 delay-100" />
                    
                    {/* Content */}
                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                                <Icon className="w-7 h-7" />
                                {/* Icon glow effect */}
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-300`} />
                            </div>
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient} animate-pulse`} />
                        </div>
                        
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                {label}
                            </p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-slate-900 group-hover:to-slate-600 dark:group-hover:from-white dark:group-hover:to-slate-300 transition-all duration-300">
                                {formatter(stats[key] || 0)}
                            </p>
                        </div>
                        

                    </div>
                    
                    {/* Bottom accent */}
                    <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${gradient} opacity-30 group-hover:opacity-60 transition-opacity duration-300`} />
                </motion.div>
            ))}
        </motion.div>
    );
}
