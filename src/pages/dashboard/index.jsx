import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import format from 'date-fns/format';
import waecResultChecker from '../../images/waec-result-checker.jpg';
import necoResultChecker from '../../images/neco-result-checker.jpg';
import nabtebResultChecker from '../../images/nabteb-result-checker.jpg';
import nbaisResultChecker from '../../images/nabteb-result-checker.jpg';
import waecGce from '../../images/waec-gce.jpg';
import { FiChevronDown, FiChevronUp, FiRefreshCcw, FiSearch } from 'react-icons/fi';
import { useTransactions } from '../../contexts/TransactionContext';

const Dashboards = () => {
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { transactions } = useTransactions();

  // Enhanced data structures
  const balanceData = {
    totalBalance: '₦0.00',
    items: [
      { label: 'Scratch Cards', value: 0, icon: 'scr' },
      { label: 'MTN Data Coupon', value: 0, icon: 'data' },
      { label: 'Available Credits', value: 0, icon: 'credit' },
    ],
  };

  // Use transactions from context
  const recentTransactions = transactions.map(tx => ({
    ...tx,
    date: tx.date.split('T')[0]
  }));

  const services = [
    {
      title: 'WAEC Result Checker',
      price: '₦3,400.00',
      image: waecResultChecker,
      link: '/homepage/scratch-card/waec-checker',
      category: 'education',
      popularity: 'high',
      features: ['Instant results', 'Secure payment', '24/7 support']
    },
    {
      title: 'NECO Result Checker',
      price: '₦1,300.00',
      image: necoResultChecker,
      link: '/homepage/scratch-card/neco-checker',
      category: 'education',
      popularity: 'medium',
      features: ['Fast processing', 'Easy to use', 'Detailed reports']
    },
    {
      title: 'NABTEB Result Checker',
      price: '₦900.00',
      image: nabtebResultChecker,
      link: '/homepage/scratch-card/nabteb-checker',
      category: 'education',
      popularity: 'low',
      features: ['Quick results', 'Affordable', 'User-friendly']
    },
    {
      title: 'NBAIS Result Checker',
      price: '₦1,100.00',
      image: nbaisResultChecker,
      link: '/homepage/scratch-card/nbais-checker',
    },
    {
      title: 'WAEC GCE',
      price: '₦28,000.00',
      image: waecGce,
      link: '/homepage/scratch-card/waec-gce',
    },
  ];

  // Animation variants
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

  return (
    <div className=" bg-gray-50 min-h-screen font-nunito lg:ml-0 md:ml-20">
      {/* Balance Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Balance Card */}
          <motion.div variants={cardVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <h4 className="text-xl font-semibold text-text-color">
                Wallet Balance: <span className="text-primary-color">{balanceData.totalBalance}</span>
              </h4>
              <Link
                to="/homepage/wallet"
                className="bg-primary-color text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors duration-300"
              >
                Fund Wallet
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {balanceData.items.map((item, index) => (
                <li key={index} className="flex justify-between items-center text-sm text-gray-600">
                  <span>{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Recent Transactions Card */}
          <motion.div variants={cardVariants} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <h4 className="text-xl font-semibold text-text-color">Recent Transactions</h4>
              {recentTransactions.length > 2 && (
                <button
                  onClick={toggleTransactions}
                  className="text-primary-color text-sm font-medium hover:underline"
                >
                  {showAllTransactions ? 'Show Less' : 'View All'}
                </button>
              )}
            </div>
            <ul className="mt-4 space-y-3">
              {(showAllTransactions ? recentTransactions : recentTransactions.slice(0, 2)).map((transaction) => (
                <motion.li
                  key={transaction.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: transaction.id * 0.1 }}
                  className="flex justify-between items-center text-sm text-gray-600"
                >
                  <div>
                    <span className="block">{transaction.label}</span>
                    <span className="text-xs text-gray-400">{transaction.date}</span>
                  </div>
                  <span className="font-medium">{transaction.amount}</span>
                </motion.li>
              ))}
              {recentTransactions.length === 0 && (
                <li className="text-center text-gray-500 text-sm">No recent transactions</li>
              )}
            </ul>
          </motion.div>
        </div>
      </motion.section>

      {/* Services Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-8"
      >
        <h1 className="text-2xl font-bold text-text-color mb-2">Our Services</h1>
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
                <h5 className="text-lg font-semibold text-text-color">{service.title}</h5>
                <p className="text-gray-600 text-sm mt-1">{service.price}</p>
                <Link
                  to={service.link}
                  className="block mt-3 bg-primary-color text-white text-center px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors duration-300"
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

export default Dashboards;