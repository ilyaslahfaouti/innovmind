import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Wallet, 
  Bitcoin, 
  Receipt, 
  User, 
  Bot,
  TrendingUp
} from 'lucide-react'

const Sidebar = () => {
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/budget', icon: Wallet, label: 'Budget' },
    { to: '/crypto', icon: Bitcoin, label: 'Crypto' },
    { to: '/transactions', icon: Receipt, label: 'Transactions' },
    { to: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
    { to: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <div className="bg-white w-64 min-h-screen shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Eugene</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">Smart Finance Manager</p>
      </div>
      
      <nav className="mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar