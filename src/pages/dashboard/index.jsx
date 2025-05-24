// src/pages/dashboard/index.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useTransactions } from '../../contexts/TransactionContext';

const waecResultChecker = 'https://arewagate.com/images/services/waec-result-checker.jpg';
const necoResultChecker = 'https://arewagate.com/images/services/neco-result-checker.jpg';
const nabtebResultChecker = 'https://arewagate.com/images/services/nabteb-result-checker.jpg';
const nbaisResultChecker = 'https://arewagate.com/images/services/nbais-result-checker.jpg';
const waecGce = 'https://arewagate.com/images/services/waec-gce.jpg';

const Dashboard = () => {
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const { user } = useAuth();
  const { transactions, walletBalance, getRecentTransactions, getTransactionsByType, addTransaction } =
    useTransactions();

  const balanceData = {
    totalBalance: `₦${(walletBalance || 0).toLocaleString()}`,
    items: [
      {
        label: 'Scratch Cards',
        value: getTransactionsByType('scratch_card').reduce((sum, tx) => sum + tx.amount, 0),
        icon: 'scr',
      },
      {
        label: 'MTN Data Coupon',
        value: getTransactionsByType('data').reduce((sum, tx) => sum + tx.amount, 0),
        icon: 'data',
      },
      {
        label: 'Available Credits',
        value: walletBalance,
        icon: 'credit',
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

  const handleAddTransaction = () => {
    addTransaction({
      label: 'Test Transaction',
      amount: 5000,
      type: 'credit',
      paymentMethod: 'test',
      category: 'wallet',
    });
  };

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
    <div className="bg-gray-50 min-h-screen font-nunito p-6">
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-600 text-sm mt-2">Manage your services and transactions below.</p>
      </motion.section>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <h4 className="text-xl font-semibold text-gray-800">
                Wallet Balance:{' '}
                <span className="text-green-500">{balanceData.totalBalance}</span>
              </h4>
              <Link
                to="/dashboard/wallet"
                className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors duration-300"
              >
                Fund Wallet
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {balanceData.items.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center text-sm text-gray-600"
                >
                  <span>{item.label}</span>
                  <span className="font-medium">₦{item.value.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <h4 className="text-xl font-semibold text-gray-800">Recent Transactions</h4>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleAddTransaction}
                  className="text-green-500 text-sm font-medium hover:underline"
                >
                  Add Test Transaction
                </button>
                {recentTransactions.length > 2 && (
                  <button
                    onClick={toggleTransactions}
                    className="text-green-500 text-sm font-medium hover:underline"
                  >
                    {showAllTransactions ? 'Show Less' : 'View All'}
                    {showAllTransactions ? (
                      <FiChevronUp className="inline ml-1" />
                    ) : (
                      <FiChevronDown className="inline ml-1" />
                    )}
                  </button>
                )}
              </div>
            </div>
            <ul className="mt-4 space-y-3">
              {recentTransactions.length === 0 && (
                <li className="text-center text-gray-500 text-sm">No recent transactions</li>
              )}
              {(showAllTransactions ? recentTransactions : recentTransactions.slice(0, 2)).map(
                (transaction) => (
                  <motion.li
                    key={transaction.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: transaction.id * 0.1 }}
                    className="flex justify-between items-center text-sm text-gray-600"
                  >
                    <div>
                      <span className="block">{transaction.label}</span>
                      <span className="text-xs text-gray-400">
                        {transaction.date.split('T')[0]} •{' '}
                        {transaction.type.replace('_', ' ').charAt(0).toUpperCase() +
                          transaction.type.replace('_', ' ').slice(1)}
                      </span>
                    </div>
                    <span
                      className={`font-medium ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'credit' ? '+' : '-'} ₦{transaction.amount.toFixed(2)}
                    </span>
                  </motion.li>
                )
              )}
            </ul>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-8"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Our Services</h1>
        <p className="text-gray-600 text-sm mb-4">Explore our tailored solutions for your needs</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-40 object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <h5 className="text-lg font-semibold text-gray-800">{service.title}</h5>
                <p className="text-gray-600 text-sm mt-1">{service.price}</p>
                <Link
                  to={service.link}
                  onClick={() => handlePurchaseService(service)}
                  className="block mt-3 bg-green-500 text-white text-center px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors duration-300"
                >
                  Proceed
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default Dashboard;