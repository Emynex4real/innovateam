import { useState } from "react";
import data from "./data";

const Accordions = () => {
    const [selected, setSelected] = useState(null);

    function handleSingleAccordion(value){
        setSelected(value === selected ? null : value)
        console.log(value);
        
    }
      
  return (
    <div className="wrapper">
      {data && data.length > 0 ? (
        data.map((dataItem) => (
          <div className="body">
            <div onClick={()=> handleSingleAccordion(dataItem.id)} className="title">
              <h3>{dataItem.question}</h3>
              <span>+</span>
              {selected === dataItem.id ? 
              <div className="answer">
                {dataItem.answer}
              </div>
              : null}
            </div>
          </div>
        ))
      ) : (
        <div>Data not found</div>
      )}
    </div>
  );
};


export default Accordions;
