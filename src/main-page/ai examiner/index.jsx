import React, { useState } from "react";
import { FaUpload } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const AiExaminer = () => {
  const [file, setFile] = useState(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [studyType, setStudyType] = useState("Multiple Choice");
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!file) {
      toast.error("Please upload a file!");
      return;
    }
    if (!documentTitle.trim()) {
      toast.error("Please enter a document title!");
      return;
    }
    if (totalQuestions < 1) {
      toast.error("Total questions must be at least 1!");
      return;
    }

    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Questions generated successfully!");
      // Reset form
      setFile(null);
      setDocumentTitle("");
      setStudyType("Multiple Choice");
      setTotalQuestions(5);
    }, 2000); // Simulate 2-second API call
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-2xl font-bold mb-6">Upload Study Document</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Upload File</label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-green-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                  <FaUpload className="text-green-500 text-2xl mb-2" />
                  <p className="text-sm text-gray-500">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Maximum File Size: 15MB | Allowed Types: .jpg, .png, .txt, .pdf, .docx, .ppt
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.txt,.pdf,.docx,.ppt"
                />
              </label>
            </div>
          </div>

          {/* Document Title */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Document Title</label>
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder="Enter the title of the document"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow shadow-sm hover:shadow-md"
            />
          </div>

          {/* Study Type */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Study with</label>
            <select
              value={studyType}
              onChange={(e) => setStudyType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow shadow-sm hover:shadow-md"
            >
              <option>Multiple Choice</option>
              <option>True/False</option>
              <option>Essay</option>
              <option>Fill in the Blank</option>
            </select>
          </div>

          {/* Total Questions */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Total Questions</label>
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
    </div>
  );
};

export default AiExaminer;