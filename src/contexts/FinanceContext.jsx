import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const FinanceContext = createContext()

export const useFinance = () => {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return context
}

export const FinanceProvider = ({ children }) => {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [cryptoPortfolio, setCryptoPortfolio] = useState([])
  const [cryptoPrices, setCryptoPrices] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchFinanceData()
    }
  }, [user])

  const fetchFinanceData = async () => {
    setLoading(true)
    try {
      const [budgetsRes, transactionsRes, cryptoRes] = await Promise.all([
        api.get('/budgets'),
        api.get('/transactions'),
        api.get('/crypto')
      ])
      
      setBudgets(budgetsRes.data)
      setTransactions(transactionsRes.data)
      setCryptoPortfolio(cryptoRes.data)
    } catch (error) {
      console.error('Error fetching finance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addBudget = async (budgetData) => {
    try {
      const response = await api.post('/budgets', budgetData)
      setBudgets(prev => [...prev, response.data])
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add budget' 
      }
    }
  }

  const updateBudget = async (id, budgetData) => {
    try {
      const response = await api.put(`/budgets/${id}`, budgetData)
      setBudgets(prev => prev.map(b => b.id === id ? response.data : b))
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update budget' 
      }
    }
  }

  const deleteBudget = async (id) => {
    try {
      await api.delete(`/budgets/${id}`)
      setBudgets(prev => prev.filter(b => b.id !== id))
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete budget' 
      }
    }
  }

  const addTransaction = async (transactionData) => {
    try {
      const response = await api.post('/transactions', transactionData)
      setTransactions(prev => [response.data, ...prev])
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add transaction' 
      }
    }
  }

  const addCryptoHolding = async (cryptoData) => {
    try {
      const response = await api.post('/crypto', cryptoData)
      setCryptoPortfolio(prev => [...prev, response.data])
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add crypto holding' 
      }
    }
  }

  const updateCryptoPrices = async () => {
    try {
      const response = await api.get('/crypto/prices')
      setCryptoPrices(response.data)
    } catch (error) {
      console.error('Error updating crypto prices:', error)
    }
  }

  const value = {
    budgets,
    transactions,
    cryptoPortfolio,
    cryptoPrices,
    loading,
    addBudget,
    updateBudget,
    deleteBudget,
    addTransaction,
    addCryptoHolding,
    updateCryptoPrices,
    fetchFinanceData
  }

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  )
}