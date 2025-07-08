import React, { useState } from 'react'
import { Bot, Send, User, TrendingUp, DollarSign, Bitcoin } from 'lucide-react'
import { useFinance } from '../contexts/FinanceContext'

const AIAssistant = () => {
  const { budgets, transactions, cryptoPortfolio } = useFinance()
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm your AI financial assistant. I can help you analyze your spending patterns, suggest budget optimizations, and provide insights about your crypto portfolio. What would you like to know?",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const quickActions = [
    {
      icon: TrendingUp,
      title: 'Analyze Spending',
      description: 'Get insights on your spending patterns',
      prompt: 'Analyze my spending patterns and suggest improvements'
    },
    {
      icon: DollarSign,
      title: 'Budget Optimization',
      description: 'Optimize your budget allocation',
      prompt: 'Help me optimize my budget allocation'
    },
    {
      icon: Bitcoin,
      title: 'Crypto Analysis',
      description: 'Review your crypto portfolio',
      prompt: 'Analyze my crypto portfolio performance'
    }
  ]

  const generateAIResponse = (userMessage) => {
    // Simulate AI response based on user data
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
    const cryptoValue = cryptoPortfolio.reduce((sum, c) => sum + (c.amount * 50000), 0) // Mock price
    
    if (userMessage.toLowerCase().includes('spending') || userMessage.toLowerCase().includes('analyze')) {
      return `Based on your financial data, here's what I found:

📊 **Spending Analysis:**
- Total Budget: $${totalBudget.toLocaleString()}
- Amount Spent: $${totalSpent.toLocaleString()}
- Remaining: $${(totalBudget - totalSpent).toLocaleString()}

💡 **Recommendations:**
1. You're ${totalSpent > totalBudget * 0.8 ? 'approaching' : 'within'} your budget limits
2. Consider reducing spending in your highest expense categories
3. Set up automatic savings for better financial discipline

Would you like me to dive deeper into any specific category?`
    }
    
    if (userMessage.toLowerCase().includes('budget') || userMessage.toLowerCase().includes('optimize')) {
      return `Here's my budget optimization analysis:

🎯 **Budget Optimization Suggestions:**
1. **Emergency Fund**: Aim for 3-6 months of expenses
2. **50/30/20 Rule**: 50% needs, 30% wants, 20% savings
3. **Category Review**: Some categories might need adjustment

📈 **Action Items:**
- Increase savings allocation by 5%
- Review subscription services for potential cuts
- Consider automating bill payments to avoid late fees

Would you like me to create a personalized budget plan?`
    }
    
    if (userMessage.toLowerCase().includes('crypto')) {
      return `Your crypto portfolio analysis:

₿ **Portfolio Overview:**
- Total Value: $${cryptoValue.toLocaleString()}
- Holdings: ${cryptoPortfolio.length} different cryptocurrencies
- Diversification: ${cryptoPortfolio.length > 3 ? 'Good' : 'Consider diversifying'}

⚠️ **Risk Assessment:**
- Crypto should be 5-10% of total portfolio
- Consider dollar-cost averaging for volatile assets
- Keep emergency fund in stable assets

📊 **Recommendations:**
1. Rebalance if crypto exceeds 10% of net worth
2. Set stop-loss orders for risk management
3. Stay updated on regulatory changes

Need help with specific crypto strategies?`
    }
    
    return `I understand you're asking about "${userMessage}". Based on your financial profile:

💰 **Current Status:**
- Budget Health: ${totalSpent < totalBudget * 0.8 ? 'Good' : 'Needs Attention'}
- Crypto Exposure: $${cryptoValue.toLocaleString()}
- Transaction Activity: ${transactions.length} recent transactions

How can I help you improve your financial situation? You can ask me about:
- Spending analysis and budgeting tips
- Crypto portfolio optimization
- Saving strategies and goal setting
- Investment recommendations`
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Simulate AI processing time
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: 'ai',
        content: generateAIResponse(inputMessage),
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const handleQuickAction = (prompt) => {
    setInputMessage(prompt)
    handleSendMessage()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Financial Assistant</h1>
        <p className="text-gray-600">Get personalized financial insights and recommendations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <action.icon className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{action.title}</p>
                      <p className="text-xs text-gray-500">{action.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow flex flex-col h-[600px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Eugene AI</h3>
                  <p className="text-sm text-gray-500">Your personal financial advisor</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-3xl ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-primary-600' 
                        : 'bg-gray-100'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="whitespace-pre-line">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-primary-200' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me about your finances..."
                  className="flex-1 input"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant