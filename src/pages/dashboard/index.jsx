// src/pages/dashboard/index.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Database, 
  DollarSign, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  Activity, 
  Users, 
  ArrowUpRight 
} from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

// Import images directly
import waecResultCheckerImg from '../../assets/images/services/waec-result-checker.jpg';
import necoResultCheckerImg from '../../assets/images/services/neco-result-checker.jpg';
import nabtebResultCheckerImg from '../../assets/images/services/nabteb-result-checker.jpg';
import nbaisResultCheckerImg from '../../assets/images/services/nbais-result-checker.jpg';
import waecGceImg from '../../assets/images/services/waec-gce.jpg';
import placeholderImg from '../../assets/images/services/placeholder.svg';

const Dashboard = () => {
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const { user } = useAuth();
  
  // Mock data for now - will be replaced with Supabase data
  const transactions = [];
  const walletBalance = 0;
  const getRecentTransactions = (limit) => [];
  const getTransactionsByType = (type) => [];
  const addTransaction = (transaction) => {};
  const { isDarkMode } = useDarkMode();

  const stats = [
    {
      title: "Total Balance",
      value: `₦${(walletBalance || 0).toLocaleString()}`,
      icon: DollarSign,
      change: "+12.5%",
      changeType: "positive"
    },
    {
      title: "This Month",
      value: `₦${getTransactionsByType('credit').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}`,
      icon: TrendingUp,
      change: "+8.2%",
      changeType: "positive"
    },
    {
      title: "Transactions",
      value: transactions.length.toString(),
      icon: Activity,
      change: "+23.1%",
      changeType: "positive"
    },
    {
      title: "Services Used",
      value: "12",
      icon: Users,
      change: "+4.3%",
      changeType: "positive"
    }
  ];

  const recentTransactions = getRecentTransactions(5);

  const services = [
    {
      title: 'WAEC Result Checker',
      price: '₦3,400.00',
      image: waecResultCheckerImg,
      link: '/dashboard/scratch-card/waec-checker',
      category: 'education',
      popularity: 'high',
      features: ['Instant results', 'Secure payment', '24/7 support'],
    },
    {
      title: 'NECO Result Checker',
      price: '₦1,300.00',
      image: necoResultCheckerImg,
      link: '/dashboard/scratch-card/neco-checker',
      category: 'education',
      popularity: 'medium',
      features: ['Fast processing', 'Easy to use', 'Detailed reports'],
    },
    {
      title: 'NABTEB Result Checker',
      price: '₦900.00',
      image: nabtebResultCheckerImg,
      link: '/dashboard/scratch-card/nabteb-checker',
      category: 'education',
      popularity: 'low',
      features: ['Quick results', 'Affordable', 'User-friendly'],
    },
    {
      title: 'NBAIS Result Checker',
      price: '₦1,100.00',
      image: nbaisResultCheckerImg,
      link: '/dashboard/scratch-card/nbais-checker',
      category: 'education',
    },
    {
      title: 'WAEC GCE',
      price: '₦28,000.00',
      image: waecGceImg,
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
      date: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.user_metadata?.full_name || user?.email || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div key={index} variants={cardVariants}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className={`inline-flex items-center ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {stat.change}
                      </span>
                      {" from last month"}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-7">
          {/* Wallet Overview */}
          <motion.div variants={cardVariants} className="lg:col-span-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Wallet Overview</CardTitle>
                    <CardDescription>
                      Your current balance and recent activity
                    </CardDescription>
                  </div>
                  <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link to="/dashboard/wallet">
                      Fund Wallet
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">₦{(walletBalance || 0).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Available Balance</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Scratch Cards</span>
                      </div>
                      <p className="text-lg font-semibold">
                        ₦{getTransactionsByType('scratch_card').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Data Services</span>
                      </div>
                      <p className="text-lg font-semibold">
                        ₦{getTransactionsByType('data').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div variants={cardVariants} className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Activity</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTransactions}
                  >
                    {showAllTransactions ? (
                      <>
                        Show Less <ChevronUp className="ml-1 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        View All <ChevronDown className="ml-1 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      No recent transactions
                    </p>
                  ) : (
                    (showAllTransactions ? recentTransactions : recentTransactions.slice(0, 3)).map(
                      (transaction) => (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between space-x-4"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              transaction.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                              {transaction.type === 'credit' ? '+' : '-'}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{transaction.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${
                              transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'credit' ? '+' : '-'}₦{Number(transaction.amount || 0).toLocaleString()}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {transaction.status || 'Completed'}
                            </Badge>
                          </div>
                        </motion.div>
                      )
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Services Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Available Services</h2>
              <p className="text-muted-foreground">
                Choose from our range of educational services
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/dashboard/services">View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div key={index} variants={cardVariants}>
                <Card className="h-full overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = placeholderImg;
                      }}
                    />
                    {service.popularity && (
                      <Badge 
                        className="absolute top-2 right-2" 
                        variant={service.popularity === 'high' ? 'default' : 'secondary'}
                      >
                        {service.popularity === 'high' ? 'Popular' : 'New'}
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-base line-clamp-1">
                          {service.title}
                        </h3>
                        <p className="text-2xl font-bold text-primary">
                          {service.price}
                        </p>
                      </div>
                      
                      {service.features && (
                        <ul className="space-y-1">
                          {service.features.slice(0, 2).map((feature, idx) => (
                            <li key={idx} className="flex items-center text-xs text-muted-foreground">
                              <div className="w-1 h-1 rounded-full bg-primary mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          className="flex-1 bg-primary hover:bg-primary/90"
                          onClick={() => handlePurchaseService(service)}
                        >
                          Purchase
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link to={service.link}>
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;