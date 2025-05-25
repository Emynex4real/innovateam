import React, { useState } from "react";
import { FaUpload, FaBook, FaQuestion, FaHistory } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { Tab } from "@headlessui/react";

const AiExaminer = () => {
  const [file, setFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [studyType, setStudyType] = useState("Multiple Choice");
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [history, setHistory] = useState([]);

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
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-green-900/20 p-1">
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
                  selected
                    ? 'bg-white shadow text-green-700'
                    : 'text-gray-700 hover:bg-white/[0.12] hover:text-green-600'
                }`
              }
            >
              Generate Questions
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
                  selected
                    ? 'bg-white shadow text-green-700'
                    : 'text-gray-700 hover:bg-white/[0.12] hover:text-green-600'
                }`
              }
            >
              View Questions
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
                  selected
                    ? 'bg-white shadow text-green-700'
                    : 'text-gray-700 hover:bg-white/[0.12] hover:text-green-600'
                }`
              }
            >
              History
            </Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              <div className="bg-white p-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Upload Document
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-500 transition-colors">
                      <div className="space-y-1 text-center">
                        <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
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
                        <p className="text-xs text-gray-500">
                          PDF, DOCX, PPT, PNG, JPG up to 15MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow shadow-sm hover:shadow-md"
                      placeholder="Enter document title"
                    />
                  </div>

                  {/* Study Type */}
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Question Type
                    </label>
                    <select
                      value={studyType}
                      onChange={(e) => setStudyType(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow shadow-sm hover:shadow-md"
                    >
                      <option>Multiple Choice</option>
                      <option>True/False</option>
                      <option>Fill in the Blank</option>
                    </select>
                  </div>

                  {/* Total Questions */}
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Total Questions
                    </label>
                    <input
                      type="number"
                      value={totalQuestions}
                      onChange={(e) => setTotalQuestions(Number(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow shadow-sm hover:shadow-md"
                      min="1"
                    />
                  </div>

                  {/* Generate Questions Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${
                      isLoading
                        ? "bg-green-400 cursor-not-allowed"
                        : "bg-green-700 hover:bg-green-800"
                    }`}
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
              <div className="bg-white p-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:shadow-xl">
                {generatedQuestions.length > 0 ? (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold mb-6">Generated Questions</h3>
                    {generatedQuestions.map((q, index) => (
                      <div key={q.id} className="p-6 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-lg mb-4">
                          Question {index + 1}: {q.question}
                        </h4>
                        {q.type === 'Multiple Choice' && (
                          <div className="ml-4 space-y-2">
                            {q.options.map((option, i) => (
                              <div key={i} className="flex items-center">
                                <input
                                  type="radio"
                                  name={`question-${q.id}`}
                                  id={`q${q.id}-option${i}`}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                                />
                                <label htmlFor={`q${q.id}-option${i}`} className="ml-3">
                                  {option}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                        {q.type === 'True/False' && (
                          <div className="ml-4 space-y-2">
                            {['True', 'False'].map((option, i) => (
                              <div key={i} className="flex items-center">
                                <input
                                  type="radio"
                                  name={`question-${q.id}`}
                                  id={`q${q.id}-option${i}`}
                                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                                />
                                <label htmlFor={`q${q.id}-option${i}`} className="ml-3">
                                  {option}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                        {q.type === 'Fill in the Blank' && (
                          <div className="ml-4">
                            <input
                              type="text"
                              name={`question-${q.id}`}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                              placeholder="Your answer"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaQuestion className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No questions generated</h3>
                    <p className="mt-1 text-sm text-gray-500">Generate questions to see them here.</p>
                  </div>
                )}
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <div className="bg-white p-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:shadow-xl">
                {history.length > 0 ? (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold mb-6">Generation History</h3>
                    {history.map((item) => (
                      <div key={item.id} className="p-6 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-lg">{item.title}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(item.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setGeneratedQuestions(item.questions);
                              setSelectedTab(1);
                            }}
                            className="text-green-600 hover:text-green-700"
                          >
                            View Questions
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaHistory className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No history yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Your generation history will appear here.</p>
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
