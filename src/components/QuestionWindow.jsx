import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

const QuestionWindow = ({ questions, onClose, loading }) => {

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-[80vw] min-h-[90vh] p-6 border border-gray-300 rounded-lg bg-white shadow-lg transition-all duration-500 ease-in-out animate-slide-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-700">Danh sách câu hỏi:</h2>
        <button
          className="text-red-500 font-semibold hover:text-red-600 transition-colors"
          onClick={onClose}
        >
          Đóng
        </button>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <ClipLoader color="red" size={150} aria-label="Loading Spinner" />
        </div>
      ) : questions.length > 0 ? (
        // Questions Groups
        <div className="space-y-8 max-h-[75vh] overflow-y-auto">
          {questions.map((group, groupIndex) => (
            <div key={groupIndex} className="border-b border-gray-300 pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Bộ câu hỏi {groupIndex + 1} ({group.questions?.length || 0} câu):
              </h3>

              <ul className="space-y-4">
                {group.questions?.map((item, index) => (
                  <li
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    {/* Question */}
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Câu hỏi {index + 1}: {item.question}
                    </h4>

                    {/* Options */}
                    <ul className="pl-4 space-y-2">
                      {item.options?.map((option, optionIndex) => (
                        <li
                          key={optionIndex}
                          className="text-gray-600 hover:text-gray-800 transition-all"
                        >
                          {String.fromCharCode(65 + optionIndex)}. {option}
                        </li>
                      ))}
                    </ul>

                    {/* Answer */}
                    <p className="mt-3 text-green-600 font-medium">
                      Đáp án: {item.answer}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        // No Questions Data
        <div className="text-center text-gray-500">
          Không có dữ liệu câu hỏi.
        </div>
      )}
    </div>
  );
};

export default QuestionWindow;
