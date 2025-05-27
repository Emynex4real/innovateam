// src/pages/dashboard/index.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronDown, FiChevronUp, FiCreditCard, FiDatabase, FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useTransactions } from '../../contexts/TransactionContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card";
import Button from "../../components/ui/button";
import Separator from "../../components/ui/separator";

// Service images
const waecResultChecker = '/images/services/waec-result-checker.jpg';
const necoResultChecker = '/images/services/neco-result-checker.jpg';
const nabtebResultChecker = '/images/services/nabteb-result-checker.jpg';
const nbaisResultChecker = '/images/services/nbais-result-checker.jpg';
const waecGce = '/images/services/waec-gce.jpg';

const Dashboard = () => {
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const { user } = useAuth();
  const { transactions, walletBalance, getRecentTransactions, getTransactionsByType, addTransaction } =
    useTransactions();
  const { isDarkMode } = useDarkMode();

  const balanceData = {
    totalBalance: `₦${(walletBalance || 0).toLocaleString()}`,
    items: [
      {
        label: 'Scratch Cards',
        value: getTransactionsByType('scratch_card').reduce((sum, tx) => sum + tx.amount, 0),
        icon: <FiCreditCard className="w-5 h-5" />,
      },
      {
        label: 'MTN Data Coupon',
        value: getTransactionsByType('data').reduce((sum, tx) => sum + tx.amount, 0),
        icon: <FiDatabase className="w-5 h-5" />,
      },
      {
        label: 'Available Credits',
        value: walletBalance,
        icon: <FiDollarSign className="w-5 h-5" />,
      },
    ],
  };

  const recentTransactions = getRecentTransactions(5);

  const services = [
    {
      title: 'WAEC Result Checker',
      price: '₦3,400.00',
      image: waecResultChecker,
      link: '/dashboard/scratch-card/waec-checker',
      category: 'education',
      popularity: 'high',
      features: ['Instant results', 'Secure payment', '24/7 support'],
    },
    {
      title: 'NECO Result Checker',
      price: '₦1,300.00',
      image: necoResultChecker,
      link: '/dashboard/scratch-card/neco-checker',
      category: 'education',
      popularity: 'medium',
      features: ['Fast processing', 'Easy to use', 'Detailed reports'],
    },
    {
      title: 'NABTEB Result Checker',
      price: '₦900.00',
      image: nabtebResultChecker,
      link: '/dashboard/scratch-card/nabteb-checker',
      category: 'education',
      popularity: 'low',
      features: ['Quick results', 'Affordable', 'User-friendly'],
    },
    {
      title: 'NBAIS Result Checker',
      price: '₦1,100.00',
      image: nbaisResultChecker,
      link: '/dashboard/scratch-card/nbais-checker',
      category: 'education',
    },
    {
      title: 'WAEC GCE',
      price: '₦28,000.00',
      image: waecGce,
      link: '/dashboard/scratch-card/waec-gce',
      category: 'education',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const toggleTransactions = () => setShowAllTransactions((prev) => !prev);

  const handlePurchaseService = (service) => {
    const amount = parseFloat(service.price.replace('₦', '').replace(',', ''));
    if (walletBalance < amount) {
      alert('Insufficient balance');
      return;
    }
    addTransaction({
      label: service.title,
      description: `Purchased ${service.title}`,
      amount: amount,
      type: 'debit',
      category: service.category,
      status: 'Successful',
    });
  };

  return (
    <div className={`min-h-screen font-nunito p-6 transition-colors duration-200 ${
      isDarkMode ? 'bg-dark-surface text-dark-text-primary' : 'bg-gray-50 text-gray-800'
    }`}>
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h1 className={`text-3xl font-bold ${
          isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
        }`}>
          Welcome, {user?.name || 'User'}!
        </h1>
        <p className={`text-sm mt-2 ${
          isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
        }`}>Manage your services and transactions below.</p>
      </motion.section>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={cardVariants}>
            <Card className={isDarkMode ? 'bg-dark-surface-secondary border-dark-border' : ''}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">
                    Wallet Balance:{' '}
                    <span className="text-green-500">{balanceData.totalBalance}</span>
                  </CardTitle>
                  <Button asChild variant="success">
                    <Link to="/dashboard/wallet">Fund Wallet</Link>
                  </Button>
                </div>
              </CardHeader>
              <Separator className={isDarkMode ? 'bg-dark-border' : ''} />
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  {balanceData.items.map((item, index) => (
                    <li
                      key={index}
                      className={`flex justify-between items-center text-sm ${
                        isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`p-2 rounded-lg ${
                          isDarkMode ? 'bg-dark-surface text-dark-text-primary' : 'bg-gray-100'
                        }`}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      <span className="font-medium">₦{item.value.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className={isDarkMode ? 'bg-dark-surface-secondary border-dark-border' : ''}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Recent Transactions</CardTitle>
                  <Button
                    variant="ghost"
                    onClick={toggleTransactions}
                    className={isDarkMode ? 'text-primary-400 hover:text-primary-300' : ''}
                  >
                    {showAllTransactions ? (
                      <>
                        Show Less <FiChevronUp className="ml-1" />
                      </>
                    ) : (
                      <>
                        Show All <FiChevronDown className="ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <Separator className={isDarkMode ? 'bg-dark-border' : ''} />
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  {recentTransactions.length === 0 && (
                    <li className={`text-center text-sm ${
                      isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                    }`}>No recent transactions</li>
                  )}
                  {(showAllTransactions ? recentTransactions : recentTransactions.slice(0, 2)).map(
                    (transaction) => (
                      <motion.li
                        key={transaction.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: transaction.id * 0.1 }}
                        className={`flex justify-between items-center text-sm ${
                          isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
                        }`}
                      >
                        <div>
                          <span className="block">{transaction.label}</span>
                          <span className={`text-xs ${
                            isDarkMode ? 'text-dark-text-tertiary' : 'text-gray-400'
                          }`}>
                            {transaction.date.split('T')[0]} •{' '}
                            {transaction.type.replace('_', ' ').charAt(0).toUpperCase() +
                              transaction.type.replace('_', ' ').slice(1)}
                          </span>
                        </div>
                        <span
                          className={`font-medium ${
                            transaction.type === 'credit' ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {transaction.type === 'credit' ? '+' : '-'} ₦{transaction.amount.toFixed(2)}
                        </span>
                      </motion.li>
                    )
                  )}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h2 className={`text-2xl font-bold mb-6 ${
          isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
        }`}>
          Available Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div key={index} variants={cardVariants}>
              <Card className={isDarkMode ? 'bg-dark-surface-secondary border-dark-border' : ''}>
                <CardContent className="p-0">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-6">
                    <h3 className={`text-lg font-semibold mb-2 ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                    }`}>
                      {service.title}
                    </h3>
                    <p className={`text-2xl font-bold mb-4 ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'
                    }`}>
                      {service.price}
                    </p>
                    {service.features && (
                      <ul className={`mb-4 text-sm space-y-2 ${
                        isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
                      }`}>
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="success"
                        className="flex-1"
                        onClick={() => handlePurchaseService(service)}
                      >
                        Purchase
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        asChild
                      >
                        <Link to={service.link}>Learn More</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default Dashboard;