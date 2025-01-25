import React, { useState } from 'react';
import { Link, Outlet, useLocation } from "react-router-dom";
import categoryIcon from '../../../public/shapes.png'
import productIcon from '../../../public/quality-product.png'
import userIcon from '../../../public/group.png'
import dashboardIcon from '../../../public/data-analysis.png'

function AdminDashboard() {
 const [isSidebarOpen, setIsSidebarOpen] = useState(true);
 const location = useLocation();
 
 const menuItems = [
   { 
     label: 'Dashboard', 
     path: '/administrator',
     icon:  <img src={dashboardIcon} alt="dashboard" className="w-auto h-[20px]" />
   },
   { 
     label: 'Users', 
     path: '/administrator/users',
     icon: <img src={userIcon} alt="user" className="w-auto h-[20px]" />
   },
   { 
     label: 'Products', 
     path: '/administrator/products',
     icon: <img src={productIcon} alt="product" className="w-auto h-[20px]" />
   },
   { 
     label: 'Category', 
     path: '/administrator/category',
     icon: <img src={categoryIcon} alt="category" className="w-auto h-[20px]" />
   }
 ];

 return (
    <div className="flex min-h-screen bg-gray-100">
    <div className={`fixed left-0 top-0 h-full bg-white text-gray-700 border-r shadow-lg transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center justify-between p-6 border-b">
        <h1 className={`text-xl font-bold ${isSidebarOpen ? 'block' : 'hidden'}`}>
          Admin Panel
        </h1>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isSidebarOpen ? '×' : '☰'}
        </button>
      </div>
      
      <nav className="mt-6 px-2">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors
                ${isActive ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span className={`${isSidebarOpen ? 'block' : 'hidden'} font-medium`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
   
      <div className={`absolute bottom-0 w-full p-6 border-t ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            👤
          </div>
          <div>
            <p className="font-medium text-gray-800">Admin</p>
            <p className="text-sm text-gray-500">administrator</p>
          </div>
        </div>
      </div>
    </div>
   
    <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
      <Outlet />
    </main>
   </div>
 );
}

export default AdminDashboard;