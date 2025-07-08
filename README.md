
# Eugene - Smart Finance Manager

Eugene is a comprehensive fintech application that combines traditional budget management with cryptocurrency portfolio tracking, powered by AI-driven insights and recommendations.

## 🚀 Features

### Core Functionality
- **Budget Management**: Create, track, and optimize personal budgets across multiple categories
- **Transaction Tracking**: Record and categorize income and expenses with detailed analytics
- **Crypto Portfolio**: Track cryptocurrency holdings with real-time price updates
- **AI Assistant**: Get personalized financial advice and insights powered by AI
- **Real-time Updates**: WebSocket integration for live data synchronization

### Security & Performance
- JWT-based authentication with secure password hashing
- Rate limiting and security headers
- SQLite database with proper data validation
- Responsive design optimized for all devices

## 🛠 Tech Stack

### Frontend
- **React 18** with modern hooks and context API
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **Axios** for API communication

### Backend
- **Node.js** with Express.js framework
- **SQLite** database with proper schema design
- **JWT** for authentication
- **WebSocket** for real-time communication
- **bcryptjs** for password hashing
- **Express Rate Limit** for API protection

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eugene-fintech-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   PORT=3001
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 3001) and frontend development server (port 5173).

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api

## 🗄 Database Schema

The application uses SQLite with the following main tables:

- **users**: User authentication and profile data
- **budgets**: Budget categories and limits
- **transactions**: Income and expense records
- **crypto_portfolio**: Cryptocurrency holdings

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Budget Management
- `GET /api/budgets` - Get user budgets
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Add new transaction

### Crypto Portfolio
- `GET /api/crypto/portfolio` - Get crypto holdings
- `POST /api/crypto/portfolio` - Add crypto holding
- `GET /api/crypto/prices` - Get current crypto prices

### AI Assistant
- `POST /api/ai/chat` - Chat with AI assistant

## 🤖 AI Integration

The AI assistant provides:
- Spending pattern analysis
- Budget optimization suggestions
- Crypto portfolio insights
- Personalized financial recommendations

*Note: Current implementation uses rule-based responses. For production, integrate with OpenAI API or similar service.*

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
```env
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
PORT=3001
```

### Deployment Options
- **Heroku**: Use the included Procfile
- **DigitalOcean**: Deploy using App Platform
- **AWS**: Use Elastic Beanstalk or EC2
- **Vercel**: For frontend with serverless functions

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔮 Future Enhancements

### Planned Features
- **Open Banking Integration**: Connect real bank accounts
- **Advanced AI**: Integration with GPT-4 or Claude
- **Mobile App**: React Native implementation
- **Multi-currency Support**: Support for multiple currencies
- **Investment Tracking**: Stocks and bonds portfolio
- **Bill Reminders**: Automated bill tracking and reminders
- **Export Features**: PDF reports and CSV exports

### Technical Improvements
- **PostgreSQL Migration**: For better scalability
- **Redis Caching**: For improved performance
- **Docker Containerization**: For easier deployment
- **Comprehensive Testing**: Unit and integration tests
- **CI/CD Pipeline**: Automated testing and deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@eugene-finance.com
- Documentation: [Wiki](https://github.com/your-repo/wiki)

## 🙏 Acknowledgments

- **CoinGecko API** for cryptocurrency data
- **Tailwind CSS** for the design system
- **Recharts** for beautiful data visualizations
- **Lucide** for the icon library

---

**Eugene** - Making personal finance management intelligent and accessible for everyone.
=======
# innovmind
>>>>>>> 38eb63ac4de1dd45d02dff8e22ea87e135e90cb4
