import React from "react";
import waecResultChecker from "../../images/waec-result-checker.jpg";
import necoResultChecker from "../../images/neco-result-checker.jpg";
import nabtebResultChecker from "../../images/nabteb-result-checker.jpg";
import nbaisResultChecker from "../../images/nbais-result-checker.jpg";
import waecGce from "../../images/waec-gce.jpg";

const Dashboards = () => {
  // Data for balance and recent transactions
  const balanceData = {
    totalBalance: "₦0.00",
    items: [
      { label: "Scratch Cards", value: 0 },
      { label: "MTN Data Coupon", value: 0 },
      // Add more items as needed
    ],
  };

  const recentTransactions = [
    { label: "Olevel upload Slot", amount: "₦800.00" },
    { label: "e-Wallet Topup", amount: "₦800.00" },
    // Add more transactions as needed
  ];

  // Data for services
  const services = [
    {
      title: "WAEC Result Checker",
      price: "₦3,400.00",
      image: waecResultChecker, // Use the imported image
      link: "https://arewagate.com/scratch-card/waec/744aa364-93b7-4ad5-96de-d14086de383a",
    },
    {
      title: "NECO Result Checker",
      price: "₦1,300.00",
      image: necoResultChecker, // Use the imported image
      link: "https://arewagate.com/scratch-card/waec/744aa364-93b7-4ad5-96de-d14086de383a",
    },
    {
      title: "NABTEB Result Checker",
      price: "₦900.00",
      image: nabtebResultChecker, // Use the imported image
      link: "https://arewagate.com/scratch-card/waec/744aa364-93b7-4ad5-96de-d14086de383a",
    },
    {
      title: "NBAIS Result Checker",
      price: "₦1,100.00",
      image: nbaisResultChecker, // Use the imported image
      link: "https://arewagate.com/scratch-card/waec/744aa364-93b7-4ad5-96de-d14086de383a",
    },
    {
      title: "WAEC GCE",
      price: "₦28,000.00",
      image: waecGce, // Use the imported image
      link: "https://arewagate.com/scratch-card/waec/744aa364-93b7-4ad5-96de-d14086de383a",
    },
  ];

  // Animation variants for Framer Motion
//   const cardVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
//   };

  return (
    <div >
      {/* Balance Section */}
      <section
        initial="hidden"
        animate="visible"
        className="mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Balance Card */}
          <div

            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex justify-between items-center border-b pb-4">
              <h4 className="text-xl font-bold text-green-500">
                Balance: <span className="font-bold">{balanceData.totalBalance}</span>
              </h4>
              <a
                href="#"
                className="bg-blue-500 text-white px-4 py-2 rounded-md lg:text-sm hover:bg-blue-600 transition-colors duration-300 text-xs"
              >
                Fund Wallet
              </a>
            </div>
            <ul className="mt-4">
              {balanceData.items.map((item, index) => (
                <li key={index} className="flex justify-between items-center py-2 text-sm lg:text-lg">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Transactions Card */}
          <div

            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex justify-between items-center border-b pb-4">
              <h4 className="text-lg lg:text-xl font-bold text-green-500">Recent Transactions</h4>
            </div>
            <ol className="mt-4">
              {recentTransactions.map((transaction, index) => (
                <li key={index} className="flex justify-between items-center py-2 text-sm lg:text-lg">
                  <span>{transaction.label}</span>
                  <span>{transaction.amount}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        initial="hidden"
        animate="visible"
        className="mt-8"
      >
        <h1 className="text-2xl font-bold">Our Services</h1>
        <p className="text-gray-600">Discover convenience with our tailored services.</p>
        <hr className="my-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
    
              className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-32 object-cover"
              />
              <div className="p-4">
                <h5 className="text-lg font-bold text-green-500">{service.title}</h5>
                <p className="text-gray-600">{service.price}</p>
                <a
                  href={'#'}
                  className="block mt-2 bg-blue-500 text-white text-center px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300"
                >
                  Proceed
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboards;