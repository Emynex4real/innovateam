import React, { useState, useRef } from 'react';
import { generateQuestions } from '../utils/api';

const QuestionGenerator = () => {
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');
    setQuestions('');

    // Validate file
    if (!selectedFile) {
      return;
    }

    if (selectedFile.type !== 'text/plain') {
      setError('Please upload a .txt file');
      fileInputRef.current.value = '';
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      fileInputRef.current.value = '';
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setQuestions('');

    try {
      const response = await generateQuestions(file);
      setQuestions(response.questions);
    } catch (error) {
      setError(error.error || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-lg font-medium">
            Upload Text Document
          </label>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            required
          />
          <p className="text-sm text-gray-500">
            Upload a .txt file (max 5MB) containing the text you want to generate questions from.
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || !file}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            (loading || !file) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Generating Questions...' : 'Generate Questions'}
        </button>
      </form>

      {questions && (
        <div className="mt-6 p-4 bg-green-50 rounded-md">
          <h3 className="text-lg font-medium text-green-800">Generated Questions:</h3>
          <div className="mt-2 text-green-700 whitespace-pre-wrap">
            {questions}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionGenerator; 