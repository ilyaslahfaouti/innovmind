import React, { useState, useEffect } from 'react'
import { useFinance } from '../contexts/FinanceContext'
import { Plus, TrendingUp, TrendingDown, Bitcoin } from 'lucide-react'

const Crypto = () => {
  const { cryptoPortfolio, cryptoPrices, addCryptoHolding, updateCryptoPrices } = useFinance()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    symbol: '',
    amount: '',
    purchasePrice: ''
  })

  const popularCryptos = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'DOT', name: 'Polkadot' },
    { symbol: 'LINK', name: 'Chainlink' },
    { symbol: 'LTC', name: 'Litecoin' },
    { symbol: 'XRP', name: 'Ripple' },
    { symbol: 'BCH', name: 'Bitcoin Cash' }
  ]

  useEffect(() => {
    updateCryptoPrices()
    const interval = setInterval(updateCryptoPrices, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const cryptoData = {
      ...formData,
      amount: parseFloat(formData.amount),
      purchasePrice: parseFloat(formData.purchasePrice)
    }

    const result = await addCryptoHolding(cryptoData)
    
    if (result.success) {
      setShowForm(false)
      setFormData({ symbol: '', amount: '', purchasePrice: '' })
    }
  }

  const calculatePortfolioValue = () => {
    return cryptoPortfolio.reduce((total, holding) => {
      const currentPrice = cryptoPrices[holding.symbol] || 0
      return total + (holding.amount * currentPrice)
    }, 0)
  }

  const calculateTotalInvestment = () => {
    return cryptoPortfolio.reduce((total, holding) => {
      return total + (holding.amount * holding.purchasePrice)
    }, 0)
  }

  const portfolioValue = calculatePortfolioValue()
  const totalInvestment = calculateTotalInvestment()
  const totalGainLoss = portfolioValue - totalInvestment
  const totalGainLossPercentage = totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crypto Portfolio</h1>
          <p className="text-gray-600">Track your cryptocurrency investments</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Holding</span>
        </button>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
              <p className="text-2xl font-semibold text-gray-900">${portfolioValue.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-50">
              <Bitcoin className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Investment</p>
              <p className="text-2xl font-semibold text-gray-900">${totalInvestment.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total P&L</p>
              <p className={`text-2xl font-semibold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toLocaleString()}
              </p>
              <p className={`text-sm ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercentage.toFixed(2)}%
              </p>
            </div>
            <div className={`p-3 rounded-full ${totalGainLoss >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              {totalGainLoss >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Holdings List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Holdings</h3>
        </div>
        <div className="p-6">
          {cryptoPortfolio.length === 0 ? (
            <div className="text-center py-8">
              <Bitcoin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No crypto holdings yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 btn-primary"
              >
                Add your first holding
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cryptoPortfolio.map((holding) => {
                const currentPrice = cryptoPrices[holding.symbol] || 0
                const currentValue = holding.amount * currentPrice
                const investmentValue = holding.amount * holding.purchasePrice
                const gainLoss = currentValue - investmentValue
                const gainLossPercentage = investmentValue > 0 ? (gainLoss / investmentValue) * 100 : 0
                
                return (
                  <div key={holding.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Bitcoin className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{holding.symbol}</h4>
                          <p className="text-sm text-gray-500">{holding.amount} coins</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${currentValue.toLocaleString()}</p>
                        <p className={`text-sm ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {gainLoss >= 0 ? '+' : ''}${gainLoss.toLocaleString()} ({gainLoss >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium">Current Price</p>
                        <p>${currentPrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Purchase Price</p>
                        <p>${holding.purchasePrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Holdings</p>
                        <p>{holding.amount} {holding.symbol}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Holding Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Crypto Holding</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cryptocurrency
                </label>
                <select
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  className="input w-full"
                  required
                >
                  <option value="">Select a cryptocurrency</option>
                  {popularCryptos.map((crypto) => (
                    <option key={crypto.symbol} value={crypto.symbol}>
                      {crypto.name} ({crypto.symbol})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input w-full"
                  placeholder="0.00000000"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Price (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  className="input w-full"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({ symbol: '', amount: '', purchasePrice: '' })
                  }}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Add Holding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Crypto