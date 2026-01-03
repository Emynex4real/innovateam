import React from "react";
import Accordion from './index';

const App = () => {
  const accordionItems = [
    {
      title: "Section 1",
      content: "This is the content for section 1.",
    },
    {
      title: "Section 2",
      content: "This is the content for section 2.",
    },
    {
      title: "Section 3",
      content: "This is the content for section 3.",
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-center mb-6">React Accordion Demo</h1>
      <Accordion items={accordionItems} />
    </div>
  );
};

export default App;