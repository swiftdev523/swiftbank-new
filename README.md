# 🏦 Swift Bank - Modern Banking Application

A sophisticated, responsive banking application built with React, featuring modern UI/UX design and comprehensive financial management tools.

## ✨ Features

### 🔐 **Authentication & Security**

- Secure user authentication with session management
- Firebase-based authentication with role-based access control
- Session timeout and security monitoring
- Account lockout protection

### 💰 **Banking Operations**

- **Send Money**: Transfer funds between accounts
- **Receive Money**: Share account details with copy/share functionality
- **Deposit & Withdraw**: Manage account funds
- **Transaction History**: Complete transaction tracking
- **Account Management**: Multiple account types support

### 🎨 **Modern UI/UX**

- Responsive design for all devices
- Smooth animations powered by Motion/React
- Gradient backgrounds and modern styling
- Interactive components and hover effects
- Mobile-friendly navigation

### 👥 **Admin Panel**

- User management and account administration
- Transaction monitoring and management
- Content management system
- Security center and analytics

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/swift1gh/clbank.git
   cd clbank
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🛠️ Available Scripts

| Script                 | Description                   |
| ---------------------- | ----------------------------- |
| `npm run dev`          | Start development server      |
| `npm run build`        | Build for production          |
| `npm run preview`      | Preview production build      |
| `npm run lint`         | Run ESLint with zero warnings |
| `npm run lint:fix`     | Auto-fix ESLint issues        |
| `npm run format`       | Format code with Prettier     |
| `npm run format:check` | Check code formatting         |
| `npm run type-check`   | Run TypeScript type checking  |
| `npm run clean`        | Clean build and cache files   |

## 🏗️ Technology Stack

- **Frontend**: React 19, React Router DOM
- **Styling**: Tailwind CSS, Custom CSS
- **Animations**: Motion/React (Framer Motion)
- **Icons**: React Icons
- **Build Tool**: Vite
- **Linting**: ESLint
- **Formatting**: Prettier

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── admin/           # Admin panel components
│   ├── common/          # Shared components
│   ├── dashboard/       # Dashboard-specific components
│   └── landing/         # Landing page components
├── context/             # React Context providers
├── pages/               # Page components
├── constants/           # Application constants
├── assets/              # Static assets
└── styles/              # Global styles
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_APP_NAME=Swift Bank
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development
```

## 🔐 User Access

The application is designed for two specific users with their respective roles and permissions. User authentication is managed through Firebase Auth with role-based access control.

### Customer Access

- Full banking functionality including account management, transfers, and transaction history
- Access to personal dashboard and profile management

### Admin Access

- Administrative panel with system management capabilities
- User management and oversight functions
- System configuration and monitoring tools

## 🎯 Core Features

### 💳 **Transaction Management**

- Real-time balance updates
- Transaction categorization
- Search and filter capabilities
- Export functionality

### 📱 **Responsive Design**

- Mobile-first approach
- Touch-friendly interface
- Adaptive layouts
- Cross-browser compatibility

### 🔒 **Security Features**

- Session management
- Input validation
- Error handling
- Security headers

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Deployment Options

- **Netlify**: Connect GitHub repository for auto-deployment
- **Vercel**: Import project for instant deployment
- **Static Hosting**: Upload `dist` folder to any static host

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development Guidelines

### Code Style

- Use functional components with hooks
- Follow ESLint and Prettier configurations
- Write descriptive component and function names
- Add comments for complex logic

### Component Guidelines

- Keep components small and focused
- Use TypeScript for better type safety
- Implement proper error boundaries
- Follow accessibility best practices

## 📄 License

This project is licensed under the MIT License.

## 🌟 Acknowledgments

- Modern banking interface inspiration
- React community for excellent tools
- Tailwind CSS for utility-first styling
- Motion/React for smooth animations

---

**Swift Bank** - _Bringing modern banking to your fingertips_ 🏦✨
