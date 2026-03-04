import React, { useState, useRef, useCallback } from "react";
import { X, Minimize2, Maximize2 } from "lucide-react";

/**
 * CBTCalculator — Draggable on-screen calculator for CBT exams.
 * Supports basic arithmetic and scientific operations.
 */
const CBTCalculator = ({ onClose }) => {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [expanded, setExpanded] = useState(true);
  const dragRef = useRef(null);
  const posRef = useRef({ x: 20, y: 80 });
  const draggingRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  // Drag handlers
  const handleMouseDown = useCallback((e) => {
    if (e.target.closest("button")) return;
    draggingRef.current = true;
    offsetRef.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y,
    };
    const handleMouseMove = (e) => {
      if (!draggingRef.current) return;
      posRef.current = {
        x: e.clientX - offsetRef.current.x,
        y: e.clientY - offsetRef.current.y,
      };
      if (dragRef.current) {
        dragRef.current.style.left = `${posRef.current.x}px`;
        dragRef.current.style.top = `${posRef.current.y}px`;
      }
    };
    const handleMouseUp = () => {
      draggingRef.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);

  const appendToExpression = (val) => {
    if (display === "Error") {
      setDisplay(val);
      setExpression(val);
      return;
    }
    if (display === "0" && val !== ".") {
      setDisplay(val);
      setExpression(expression + val);
    } else {
      setDisplay(display + val);
      setExpression(expression + val);
    }
  };

  const handleOperator = (op) => {
    if (display === "Error") return;
    setExpression(expression + op);
    setDisplay("0");
  };

  const handleEquals = () => {
    try {
      // Replace display-friendly symbols with JS equivalents
      let expr = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, Math.PI.toString())
        .replace(/√\(([^)]+)\)/g, "Math.sqrt($1)")
        .replace(/sin\(([^)]+)\)/g, "Math.sin(($1)*Math.PI/180)")
        .replace(/cos\(([^)]+)\)/g, "Math.cos(($1)*Math.PI/180)")
        .replace(/tan\(([^)]+)\)/g, "Math.tan(($1)*Math.PI/180)")
        .replace(/log\(([^)]+)\)/g, "Math.log10($1)")
        .replace(/ln\(([^)]+)\)/g, "Math.log($1)");

      // eslint-disable-next-line no-eval
      const result = eval(expr);
      const formatted = Number.isFinite(result)
        ? parseFloat(result.toFixed(10)).toString()
        : "Error";
      setDisplay(formatted);
      setExpression(formatted);
    } catch {
      setDisplay("Error");
      setExpression("");
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setExpression("");
  };

  const handleBackspace = () => {
    if (display.length <= 1 || display === "Error") {
      setDisplay("0");
    } else {
      const newDisplay = display.slice(0, -1);
      setDisplay(newDisplay);
      setExpression(expression.slice(0, -1));
    }
  };

  const handleScientific = (func) => {
    setExpression(expression + `${func}(`);
    setDisplay(`${func}(`);
  };

  const handleSquare = () => {
    try {
      const val = parseFloat(display);
      const result = val * val;
      setDisplay(result.toString());
      setExpression(result.toString());
    } catch {
      setDisplay("Error");
    }
  };

  const handleSqrt = () => {
    try {
      const val = parseFloat(display);
      if (val < 0) {
        setDisplay("Error");
        return;
      }
      const result = Math.sqrt(val);
      setDisplay(parseFloat(result.toFixed(10)).toString());
      setExpression(result.toString());
    } catch {
      setDisplay("Error");
    }
  };

  const basicButtons = [
    ["7", "8", "9", "÷"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "-"],
    ["0", ".", "%", "+"],
  ];

  const scientificButtons = [
    ["sin", "cos", "tan"],
    ["log", "ln", "π"],
    ["x²", "√", "("],
    [")", "±", ""],
  ];

  return (
    <div
      ref={dragRef}
      className="fixed z-50 select-none"
      style={{
        left: posRef.current.x,
        top: posRef.current.y,
        width: expanded ? 320 : 240,
      }}
    >
      <div className="rounded-xl overflow-hidden shadow-2xl border-2 border-[#003366]/50 bg-[#0a1929]">
        {/* Title Bar (draggable) */}
        <div
          onMouseDown={handleMouseDown}
          className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-[#003366] to-[#004488] cursor-move"
        >
          <span className="text-white text-xs font-bold tracking-wide">
            🧮 Calculator
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded hover:bg-white/20 text-white/80 transition"
            >
              {expanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-red-500/80 text-white/80 transition"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Display */}
        <div className="px-3 py-2 bg-[#0d2137]">
          <div className="text-right text-[10px] text-gray-500 h-4 overflow-hidden truncate">
            {expression || " "}
          </div>
          <div className="text-right text-white text-2xl font-mono font-bold truncate">
            {display}
          </div>
        </div>

        {/* Buttons Area */}
        <div className="p-2 bg-[#0a1929]">
          {/* Top row: Clear, Backspace, Equals */}
          <div className="grid grid-cols-3 gap-1.5 mb-1.5">
            <button
              onClick={handleClear}
              className="py-2.5 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold transition"
            >
              AC
            </button>
            <button
              onClick={handleBackspace}
              className="py-2.5 rounded-lg bg-amber-600/80 hover:bg-amber-500 text-white text-xs font-bold transition"
            >
              ⌫
            </button>
            <button
              onClick={handleEquals}
              className="py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition"
            >
              =
            </button>
          </div>

          <div className={`flex gap-2 ${expanded ? "" : "flex-col"}`}>
            {/* Scientific Panel (expanded only) */}
            {expanded && (
              <div className="grid grid-cols-3 gap-1.5 flex-1">
                {scientificButtons.flat().map((btn) => {
                  if (!btn) return <div key="empty" />;
                  const handler =
                    btn === "x²"
                      ? handleSquare
                      : btn === "√"
                        ? handleSqrt
                        : btn === "π"
                          ? () => appendToExpression("π")
                          : btn === "(" || btn === ")"
                            ? () => appendToExpression(btn)
                            : btn === "±"
                              ? () => {
                                  if (display !== "0" && display !== "Error") {
                                    const toggled = display.startsWith("-")
                                      ? display.slice(1)
                                      : "-" + display;
                                    setDisplay(toggled);
                                    setExpression(toggled);
                                  }
                                }
                              : () => handleScientific(btn);
                  return (
                    <button
                      key={btn}
                      onClick={handler}
                      className="py-2 rounded-lg bg-[#1a3a5c] hover:bg-[#2a4a6c] text-blue-300 text-xs font-medium transition"
                    >
                      {btn}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Basic Buttons */}
            <div className="grid grid-cols-4 gap-1.5 flex-1">
              {basicButtons.flat().map((btn) => {
                const isOp = ["÷", "×", "-", "+", "%"].includes(btn);
                return (
                  <button
                    key={btn}
                    onClick={() =>
                      isOp ? handleOperator(btn) : appendToExpression(btn)
                    }
                    className={`py-2.5 rounded-lg text-sm font-medium transition ${
                      isOp
                        ? "bg-[#003366] hover:bg-[#004488] text-blue-200"
                        : "bg-[#162d44] hover:bg-[#1e3a52] text-white"
                    }`}
                  >
                    {btn}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CBTCalculator;
