// src/pages/administrator/Dashboard/index.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
 const [stats, setStats] = useState({
   totalUsers: 0,
   totalSales: '$0',
   activeProducts: 0,
   monthlyRevenue: '$0'
 });

 useEffect(() => {
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const [usersRes, productsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/auth/kasirUsers', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:3000/api/products', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setStats(prev => ({
        ...prev,
        totalUsers: usersRes.data.users.length,
        activeProducts: productsRes.data.data.length
      }));
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };
 
  fetchStats();
 }, []);
 
 const statItems = [
  { 
    title: 'Total Users', 
    value: stats.totalUsers,
    bgColor: 'bg-blue-500',
    icon: '👥'
  },
  { 
    title: 'Active Products', 
    value: stats.activeProducts,
    bgColor: 'bg-purple-500',
    icon: '📦'
  }
 ];

 const activities = [
   {
     title: 'New User Registration',
     time: '2 minutes ago',
     description: 'John Doe registered as new cashier'
   },
   {
     title: 'Sales Transaction',
     time: '15 minutes ago',
     description: 'New sale recorded for $150'
   },
   {
     title: 'Product Update',
     time: '1 hour ago',
     description: 'Stock updated for Product A'
   }
 ];

 const quickActions = [
   {
     title: 'Add New User',
     description: 'Create a new cashier account',
     link: '/administrator/users'
   },
   {
     title: 'View Reports',
     description: 'Check daily sales reports',
     link: '#'
   },
   {
     title: 'Manage Products',
     description: 'Update product inventory',
     link: '/administrator/products'
   }
 ];

 return (
   <div className="p-6 bg-gray-50">
     <h2 className="text-3xl font-bold mb-8 text-gray-800">Dashboard Overview</h2>
     
     {/* Stats Grid */}
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
       {statItems.map((stat, index) => (
         <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
           <div className={`p-4 ${stat.bgColor} text-white`}>
             <span className="text-2xl">{stat.icon}</span>
           </div>
           <div className="p-4">
             <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
             <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
           </div>
         </div>
       ))}
     </div>

     {/* Activity and Quick Actions Grid */}
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       <div className="bg-white rounded-xl shadow-md p-6">
         <h3 className="text-xl font-semibold mb-6 text-gray-800">Recent Activity</h3>
         <div className="space-y-6">
           {activities.map((activity, index) => (
             <div key={index} className="border-l-4 border-blue-500 pl-4">
               <h4 className="font-semibold text-gray-800">{activity.title}</h4>
               <p className="text-gray-500 text-sm">{activity.description}</p>
               <span className="text-xs text-gray-400">{activity.time}</span>
             </div>
           ))}
         </div>
       </div>

       <div className="bg-white rounded-xl shadow-md p-6">
         <h3 className="text-xl font-semibold mb-6 text-gray-800">Quick Actions</h3>
         <div className="space-y-4">
           {quickActions.map((action, index) => (
             <a 
               key={index} 
               href={action.link}
               className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
             >
               <h4 className="font-semibold text-gray-800">{action.title}</h4>
               <p className="text-gray-500 text-sm">{action.description}</p>
             </a>
           ))}
         </div>
       </div>
     </div>
   </div>
 );
}

export default Dashboard;