import React from "react";
import Accordion from './index';

const Data = () => {
  const accordionItems = [
    {
      title: "How can I fund my wallet?",
      content: "You can fund your wallet using any of our two payment means.  ",
      content1: "Online Payment with your ATM card details via Pay stack or flutter wave Payment Gateway.",
      content2: "Payment with bank transfer using mobile app or internet bank. Make sure you put the code on payment reference section. After payment click I have paid on your dashboard to get value."
    },
    {
      title: "How am I sure Innovateam is not for scammers?",
      content: "We've being in business for years TESTED AND TRUSTED And have made reputation from our happy clients.",
      content1: " You can attest through the feedback section.",
      // content2: "Payment with bank transfer using mobile app or internet bank. Make sure you put the code on payment reference section. After payment click I have paid on your dashboard to get value."
    },
    {
      title: "What are the other products/services you offer?",
      content: " We sell Cheap Exams Result Checkers,  Internet Data Plans, Airtime VTU on MTN, 9MOBILE, GLO and AIRTEL, CBT Exams Practice, Bills Payment (GOTV, DSTV, STARTIMES) etc.",
    },
    {
      title: "What if I make payment and my account is debited and my wallet was not funded?",
      content: "Chat admin on whatsapp +234 703 837 4534",
    },
    {
      title: "What if my order has been approved, but not yet received?",
      content: "Sincere apologies about that, we regret the inconvenience caused. Kindly reach out to us through our customer care line (+234 703 837 4534) via WhatsApp with the order details",
    },
    {
      title: "What's your working period?",
      content: "For All service 24hrs 7days",
      content1: "For customer service Monday to Saturday 8.30am to 5.00pm.",
    },
  ];

  return (
    // <div className="container">
    //   <h1 className="text-3xl font-bold text-center mb-6">FAQs</h1>
    //   <Accordion items={accordionItems} />
    // </div>
       <div className="py-10">
       <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">
         Frequently Asked Questions
       </h1>
       <Accordion items={accordionItems} allowMultiple={true} />
     </div>
  );
};

export default Data;