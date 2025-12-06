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
  ArrowUpRight,
  Brain,
  Trophy,
  BarChart3,
  BookOpen,
  Zap,
  Award,
  Flame,
  Target,
  AlertCircle,
  X,
  Clock
} from 'lucide-react';
import { useAuth } from '../../App';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useWallet } from '../../contexts/WalletContext';
import PaymentModal from '../../components/PaymentModal';
import toast from 'react-hot-toast';
import EducationalSidebar from '../../components/EducationalSidebar';

// Import images directly
import waecResultCheckerImg from '../../assets/images/services/waec-result-checker.jpg';
import necoResultCheckerImg from '../../assets/images/services/neco-result-checker.jpg';
import nabtebResultCheckerImg from '../../assets/images/services/nabteb-result-checker.jpg';
import nbaisResultCheckerImg from '../../assets/images/services/nbais-result-checker.jpg';
import waecGceImg from '../../assets/images/services/waec-gce.jpg';
import placeholderImg from '../../assets/images/services/placeholder.svg';

const Dashboard = () => {
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLowBalanceAlert, setShowLowBalanceAlert] = useState(true);
  const { user } = useAuth();
  
  const { walletBalance, transactions, getRecentTransactions, getTransactionsByType, addTransaction } = useWallet();
  const { isDarkMode } = useDarkMode();

  // Get practice stats from localStorage
  const getPracticeStats = () => {
    try {
      const stats = JSON.parse(localStorage.getItem(`practice_stats_${user?.id}`) || '{}');
      const history = JSON.parse(localStorage.getItem(`practice_history_${user?.id}`) || '[]');
      
      // Calculate streak
      const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
      let streak = 0;
      const today = new Date().toDateString();
      
      for (let i = 0; i < sortedHistory.length; i++) {
        const sessionDate = new Date(sortedHistory[i].date).toDateString();
        const expectedDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toDateString();
        if (sessionDate === expectedDate || (i === 0 && sessionDate === today)) {
          streak++;
        } else break;
      }
      
      const totalQuestions = stats.totalQuestions || 0;
      const level = Math.floor(totalQuestions / 50) + 1;
      const progress = (totalQuestions % 50) / 50 * 100;
      
      return {
        totalSessions: history.length,
        averageScore: stats.averageScore || 0,
        streak,
        level,
        progress,
        totalQuestions
      };
    } catch {
      return { totalSessions: 0, averageScore: 0, streak: 0, level: 1, progress: 0, totalQuestions: 0 };
    }
  };

  const practiceStats = getPracticeStats();

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

  const handlePurchaseService = async (service) => {
    const amount = parseFloat(service.price.replace('₦', '').replace(',', ''));
    if (walletBalance < amount) {
      toast.error('Insufficient balance. Please fund your wallet.');
      setShowPaymentModal(true);
      return;
    }
    
    try {
      const result = await addTransaction({
        label: service.title,
        description: `Purchased ${service.title}`,
        amount: amount,
        type: 'debit',
        category: service.category,
        status: 'Successful',
        date: new Date().toISOString()
      });
      
      if (result.success) {
        toast.success(`${service.title} purchased successfully!`);
      } else {
        toast.error('Purchase failed. Please try again.');
      }
    } catch (error) {
      toast.error('Purchase failed. Please try again.');
    }
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

        {/* Low Balance Alert */}
        {walletBalance < 5000 && showLowBalanceAlert && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-900 dark:text-orange-200">Low Balance Warning</h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                    Your wallet balance is low (₦{walletBalance.toLocaleString()}). Fund your wallet to continue using services.
                  </p>
                  <Button onClick={() => setShowPaymentModal(true)} size="sm" className="mt-2 bg-orange-600 hover:bg-orange-700">
                    Fund Wallet Now
                  </Button>
                </div>
              </div>
              <button onClick={() => setShowLowBalanceAlert(false)} className="text-orange-600 hover:text-orange-800">
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

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

        {/* Quick Actions & Progress */}
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div variants={cardVariants} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Access your learning tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Link to="/dashboard/practice-questions">
                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary">
                      <BookOpen className="h-5 w-5" />
                      <span className="text-xs font-medium">Practice</span>
                    </Button>
                  </Link>
                  <Link to="/dashboard/course-advisor">
                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary">
                      <Brain className="h-5 w-5" />
                      <span className="text-xs font-medium">AI Advisor</span>
                    </Button>
                  </Link>
                  <Link to="/dashboard/leaderboard">
                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary">
                      <Trophy className="h-5 w-5" />
                      <span className="text-xs font-medium">Leaderboard</span>
                    </Button>
                  </Link>
                  <Link to="/dashboard/analytics">
                    <Button variant="outline" className="w-full h-20 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary">
                      <BarChart3 className="h-5 w-5" />
                      <span className="text-xs font-medium">Analytics</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Progress Widget */}
          <motion.div variants={cardVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">Level {practiceStats.level}</p>
                      <p className="text-xs text-muted-foreground">{practiceStats.totalQuestions} questions</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress to Level {practiceStats.level + 1}</span>
                    <span className="font-medium">{Math.round(practiceStats.progress)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${practiceStats.progress}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-lg font-bold">{practiceStats.streak}</p>
                      <p className="text-xs text-muted-foreground">Day Streak</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="text-lg font-bold">{practiceStats.averageScore}%</p>
                      <p className="text-xs text-muted-foreground">Avg Score</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
                  <Button 
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Fund Wallet
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

          {/* Recent Activity Timeline */}
          <motion.div variants={cardVariants} className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your transaction timeline</CardDescription>
                  </div>
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
                <div className="relative space-y-4">
                  {recentTransactions.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      No recent transactions
                    </p>
                  ) : (
                    <>
                      {/* Timeline line */}
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                      
                      {(showAllTransactions ? recentTransactions : recentTransactions.slice(0, 3)).map(
                        (transaction, index) => (
                          <motion.div
                            key={transaction.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex items-start gap-4 pl-10"
                          >
                            {/* Timeline dot */}
                            <div className={`absolute left-0 h-8 w-8 rounded-full flex items-center justify-center border-2 border-background ${
                              transaction.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}>
                              {transaction.type === 'credit' ? '+' : '-'}
                            </div>
                            
                            <div className="flex-1 bg-muted/50 rounded-lg p-3 hover:bg-muted transition-colors">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{transaction.label}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(transaction.date).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-sm font-bold ${
                                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {transaction.type === 'credit' ? '+' : '-'}₦{Number(transaction.amount || 0).toLocaleString()}
                                  </p>
                                  <Badge variant="secondary" className="text-xs mt-1">
                                    {transaction.status || 'Completed'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      )}
                    </>
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
                          asChild
                        >
                          <Link to={service.link}>
                            Purchase
                          </Link>
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
        
        <PaymentModal 
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => setShowPaymentModal(false)}
        />
      </div>
  );
};

export default Dashboard;