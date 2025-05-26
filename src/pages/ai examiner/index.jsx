import React, { useState } from "react";
import { FaUpload, FaBook, FaQuestion, FaHistory } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { Tab } from "@headlessui/react";
import { useDarkMode } from "../../contexts/DarkModeContext";

const AiExaminer = () => {
  const [file, setFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [studyType, setStudyType] = useState("Multiple Choice");
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [history, setHistory] = useState([]);
  const { isDarkMode } = useDarkMode();

  // Allowed file types and size limit (15MB)
  const allowedFileTypes = [
    "image/jpeg",
    "image/png",
    "text/plain",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];
  const maxFileSize = 15 * 1024 * 1024; // 15MB in bytes

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    if (!allowedFileTypes.includes(selectedFile.type)) {
      toast.error("Invalid file type! Allowed types: .jpg, .png, .txt, .pdf, .docx, .ppt");
      return;
    }

    // Validate file size
    if (selectedFile.size > maxFileSize) {
      toast.error("File size exceeds 15MB!");
      return;
    }

    setFile(selectedFile);
    toast.success("File uploaded successfully!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please upload a file");
      return;
    }

    if (!documentTitle.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement API call to generate questions
      const mockQuestions = [
        {
          id: 1,
          type: studyType,
          question: "What is the main topic of the document?",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        },
        // Add more mock questions as needed
      ];

      setGeneratedQuestions(mockQuestions);
      setSelectedTab(1);
      
      // Add to history
      setHistory([...history, {
        id: Date.now(),
        title: documentTitle,
        type: studyType,
        questions: mockQuestions,
        timestamp: new Date().toISOString(),
      }]);

      toast.success("Questions generated successfully!");
    } catch (error) {
      toast.error("Failed to generate questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${
      isDarkMode ? 'bg-dark-surface text-dark-text-primary' : 'bg-gray-100'
    }`}>
      <div className="max-w-4xl mx-auto">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className={`flex space-x-1 rounded-xl p-1 ${
            isDarkMode ? 'bg-dark-surface-secondary' : 'bg-green-900/20'
          }`}>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ${
                  selected
                    ? isDarkMode
                      ? 'bg-dark-surface text-green-400 shadow-lg'
                      : 'bg-white shadow text-green-700'
                    : isDarkMode
                      ? 'text-dark-text-secondary hover:bg-dark-border hover:text-green-400'
                      : 'text-gray-700 hover:bg-white/[0.12] hover:text-green-600'
                }`
              }
            >
              Generate Questions
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ${
                  selected
                    ? isDarkMode
                      ? 'bg-dark-surface text-green-400 shadow-lg'
                      : 'bg-white shadow text-green-700'
                    : isDarkMode
                      ? 'text-dark-text-secondary hover:bg-dark-border hover:text-green-400'
                      : 'text-gray-700 hover:bg-white/[0.12] hover:text-green-600'
                }`
              }
            >
              View Questions
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200 ${
                  selected
                    ? isDarkMode
                      ? 'bg-dark-surface text-green-400 shadow-lg'
                      : 'bg-white shadow text-green-700'
                    : isDarkMode
                      ? 'text-dark-text-secondary hover:bg-dark-border hover:text-green-400'
                      : 'text-gray-700 hover:bg-white/[0.12] hover:text-green-600'
                }`
              }
            >
              History
            </Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              <div className={`p-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:shadow-xl ${
                isDarkMode ? 'bg-dark-surface-secondary border border-dark-border' : 'bg-white'
              }`}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                    }`}>
                      Upload Document
                    </label>
                    <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'border-dark-border hover:border-green-500' 
                        : 'border-gray-300 hover:border-green-500'
                    }`}>
                      <div className="space-y-1 text-center">
                        <FaUpload className={`mx-auto h-12 w-12 ${
                          isDarkMode ? 'text-dark-text-secondary' : 'text-gray-400'
                        }`} />
                        <div className={`flex text-sm ${
                          isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
                        }`}>
                          <label htmlFor="file-upload" className={`relative cursor-pointer rounded-md font-medium ${
                            isDarkMode ? 'text-green-400 hover:text-green-500' : 'text-green-600 hover:text-green-500'
                          } focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500`}>
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className={`text-xs ${
                          isDarkMode ? 'text-dark-text-tertiary' : 'text-gray-500'
                        }`}>
                          PDF, DOCX, PPT, PNG, JPG up to 15MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                    }`}>
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow shadow-sm hover:shadow-md ${
                        isDarkMode 
                          ? 'bg-dark-surface border-dark-border text-dark-text-primary' 
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter document title"
                    />
                  </div>

                  {/* Study Type */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                    }`}>
                      Question Type
                    </label>
                    <select
                      value={studyType}
                      onChange={(e) => setStudyType(e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow shadow-sm hover:shadow-md ${
                        isDarkMode 
                          ? 'bg-dark-surface border-dark-border text-dark-text-primary' 
                          : 'border-gray-300'
                      }`}
                    >
                      <option>Multiple Choice</option>
                      <option>True/False</option>
                      <option>Fill in the Blank</option>
                    </select>
                  </div>

                  {/* Total Questions */}
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                    }`}>
                      Total Questions
                    </label>
                    <input
                      type="number"
                      value={totalQuestions}
                      onChange={(e) => setTotalQuestions(Number(e.target.value))}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow shadow-sm hover:shadow-md ${
                        isDarkMode 
                          ? 'bg-dark-surface border-dark-border text-dark-text-primary' 
                          : 'border-gray-300'
                      }`}
                      min="1"
                    />
                  </div>

                  {/* Generate Questions Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${
                      isLoading
                        ? isDarkMode ? 'bg-green-600/50' : 'bg-green-400'
                        : isDarkMode
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-green-700 hover:bg-green-800'
                    } disabled:cursor-not-allowed`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Generating...
                      </div>
                    ) : (
                      "Generate Questions"
                    )}
                  </button>
                </form>
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <div className={`p-8 rounded-lg shadow-lg ${
                isDarkMode ? 'bg-dark-surface-secondary border border-dark-border' : 'bg-white'
              }`}>
                {generatedQuestions.length === 0 ? (
                  <p className={`text-center py-8 ${
                    isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
                  }`}>
                    No questions generated yet. Generate some questions first!
                  </p>
                ) : (
                  <div className="space-y-6">
                    {generatedQuestions.map((question, index) => (
                      <div key={question.id} className={`p-6 rounded-lg ${
                        isDarkMode ? 'bg-dark-surface border border-dark-border' : 'bg-gray-50'
                      }`}>
                        <h3 className={`font-medium mb-4 ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                        }`}>
                          {index + 1}. {question.question}
                        </h3>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className={`p-3 rounded-lg ${
                              isDarkMode 
                                ? 'bg-dark-surface-secondary hover:bg-dark-border' 
                                : 'bg-white hover:bg-gray-100'
                            } transition-colors duration-200`}>
                              {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <div className={`p-8 rounded-lg shadow-lg ${
                isDarkMode ? 'bg-dark-surface-secondary border border-dark-border' : 'bg-white'
              }`}>
                {history.length === 0 ? (
                  <p className={`text-center py-8 ${
                    isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
                  }`}>
                    No history yet. Generate some questions first!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {history.map((item) => (
                      <div key={item.id} className={`p-4 rounded-lg ${
                        isDarkMode ? 'bg-dark-surface border border-dark-border' : 'bg-gray-50'
                      }`}>
                        <h3 className={`font-medium ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                        }`}>{item.title}</h3>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
                        }`}>
                          {item.type} • {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

export default AiExaminer;
