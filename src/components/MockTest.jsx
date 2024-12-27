import React, { useState } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';

const MockTest = ({ questions, onBack }) => {
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    const handleAnswerSelect = (chapterIndex, questionIndex, selectedOption) => {
        setUserAnswers(prev => ({
            ...prev,
            [`${chapterIndex}-${questionIndex}`]: selectedOption
        }));
    };

    const handleSubmit = () => {
        setShowResults(true);
    };

    const handleRetake = () => {
        setUserAnswers({});
        setShowResults(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Questions
                        </button>
                        <h2 className="text-xl font-bold text-gray-800">Mock Test</h2>
                    </div>
                    {!showResults && (
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Submit Test
                        </button>
                    )}
                    {showResults && (
                        <button
                            onClick={handleRetake}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Retake Test
                        </button>
                    )}
                </div>

                {/* Questions */}
                <div className="space-y-8">
                    {questions.map((chapterGroup, chapterIndex) => (
                        <div key={chapterIndex} className="space-y-6">
                            <h3 className="text-lg font-bold text-gray-800">
                                Chapter: {chapterGroup.chapterName}
                            </h3>
                            {chapterGroup.questions.map((question, questionIndex) => (
                                <div
                                    key={questionIndex}
                                    className="p-4 border rounded-lg hover:shadow-md transition-all"
                                >
                                    <p className="font-medium text-gray-800 mb-4">
                                        {questionIndex + 1}. {question.question}
                                    </p>
                                    <div className="space-y-2">
                                        {question.options?.map((option, optionIndex) => {
                                            const isSelected = userAnswers[`${chapterIndex}-${questionIndex}`] === option;
                                            const isCorrect = showResults && question.answer === option;
                                            const isWrong = showResults && isSelected && !isCorrect;

                                            return (
                                                <button
                                                    key={optionIndex}
                                                    onClick={() => !showResults && handleAnswerSelect(chapterIndex, questionIndex, option)}
                                                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between
                            ${isSelected ? 'border-2' : 'border'}
                            ${isCorrect ? 'bg-green-50 border-green-500' : ''}
                            ${isWrong ? 'bg-red-50 border-red-500' : ''}
                            ${!showResults && 'hover:bg-gray-50'}
                            ${!showResults && isSelected ? 'border-blue-500' : 'border-gray-200'}
                          `}
                                                    disabled={showResults}
                                                >
                                                    <span>{option}</span>
                                                    {showResults && isCorrect && (
                                                        <Check className="w-5 h-5 text-green-500" />
                                                    )}
                                                    {showResults && isWrong && (
                                                        <X className="w-5 h-5 text-red-500" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {showResults && (
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                            <span className="font-medium text-blue-800">
                                                Correct Answer: {question.answer}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MockTest;
