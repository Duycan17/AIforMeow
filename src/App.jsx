import React, { useState } from 'react';
import './App.css';
import QuestionWindow from './components/QuestionWindow';
import { generateQuestions, generateQuestionsFromFile } from './services';
import BeatLoader from "react-spinners/ClipLoader";

function App() {
  const [fileContent, setFileContent] = useState('');
  const [showQuestions, setShowQuestions] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setLoading(true);
      try {
        const results = await generateQuestionsFromFile(Array.from(files));
        const allQuestions = results.flat();
        setQuestions(allQuestions);
        setShowQuestions(true);
        // exportQuestionsAsJSON(allQuestions);
      } catch (error) {
        console.error('Failed to generate questions from files:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // const exportQuestionsAsJSON = (questions) => {
  //   const json = JSON.stringify(questions, null, 2);
  //   const blob = new Blob([json], { type: 'application/json' });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.download = 'questions.json';
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  const handleCreateQuestionsClick = async () => {
    setLoading(true);
    try {
      const response = await generateQuestions(fileContent);
      setQuestions(response.questions); // Assuming response contains a `questions` field
      setShowQuestions(true);
    } catch (error) {
      console.error('Failed to generate questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseQuestions = () => {
    setQuestions([]);
    setShowQuestions(false);
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 p-4">
      <textarea
        value={fileContent}
        className="w-3/4 h-1/2 p-4 border border-gray-300 rounded-lg mb-6 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform transform hover:scale-105"
        placeholder="Nhập nội dung văn bản"
        onChange={(e) => setFileContent(e.target.value)}
      />
      <div className="flex w-3/4 space-x-4 mb-4">
        <div className="w-full">
          <input
            type="file"
            onChange={handleFileUpload}
            id="fileUpload"
            multiple
            className="hidden"
          />
          <label
            htmlFor="fileUpload"
            className="cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-gradient-to-l shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out block text-center"
          >
            Tải file văn bản lên
          </label>
        </div>
        <div className="w-full">
          <button
            className="bg-gradient-to-r from-green-400 to-teal-500 text-white px-4 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out w-full"
            onClick={handleCreateQuestionsClick}
          >
            Tạo danh sách câu hỏi từ văn bản
          </button>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 bg-gray-500">
          <BeatLoader color="red" />
        </div>
      )}

      {showQuestions && (
        <div className="transition-opacity duration-500 ease-in-out opacity-100 animate-fade-in">
          <QuestionWindow questions={questions} onClose={handleCloseQuestions} />
        </div>
      )}
    </div>
  );
}

export default App;
