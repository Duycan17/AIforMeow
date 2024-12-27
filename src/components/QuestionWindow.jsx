import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Download, PenLine } from 'lucide-react';
import MockTest from './MockTest';

const QuestionWindow = ({ questions, onClose }) => {
    const [showMockTest, setShowMockTest] = useState(false);

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        questions.forEach((chapterGroup, groupIndex) => {
            // Add chapter title
            if (groupIndex > 0) {
                doc.addPage();
            }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.text(`Chapter ${groupIndex + 1}: ${chapterGroup.chapterName}`, 14, 20);

            // Process questions for this chapter
            const questionsData = chapterGroup.questions.map((item, index) => {
                const questionText = `Question ${index + 1}: ${item.question}`;
                const options = item.options?.map((opt, idx) =>
                    `${String.fromCharCode(65 + idx)}. ${opt}`
                ).join('\n') || '';
                const answer = `Answer: ${item.answer}`;

                return [questionText, options, answer];
            });

            doc.autoTable({
                startY: 30,
                head: [['Question', 'Options', 'Answer']],
                body: questionsData,
                styles: {
                    fontSize: 10,
                    cellPadding: 5
                },
                columnStyles: {
                    0: { cellWidth: 70 },
                    1: { cellWidth: 70 },
                    2: { cellWidth: 40 }
                },
                headStyles: {
                    fillColor: [63, 70, 229],
                    textColor: [255, 255, 255]
                }
            });
        });

        // Save the PDF
        doc.save('questions.pdf');
    };

    const handleStartMockTest = () => {
        setShowMockTest(true);
    };

    if (showMockTest) {
        return (
            <MockTest
                questions={questions}
                onBack={() => setShowMockTest(false)}
            />
        );
    }

    return (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-[80vw] min-h-[90vh] p-6 border border-gray-300 rounded-lg bg-white shadow-lg transition-all duration-500 ease-in-out animate-slide-in">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-700">List of questions:</h2>
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        <span>Download PDF</span>
                    </button>
                    <button
                        onClick={handleStartMockTest}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <PenLine className="w-4 h-4" />
                        <span>Start Mock Test</span>
                    </button>
                </div>
                <button
                    className="text-red-500 font-semibold hover:text-red-600 transition-colors"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>

            {/* Question List */}
            {questions.length > 0 ? (
                <div className="space-y-8 max-h-[75vh] overflow-y-auto">
                    {questions.map((chapterGroup, groupIndex) => (
                        <div key={groupIndex} className="border-b border-gray-300 pb-6">
                            {/* Chapter Header */}
                            <h3 className="text-lg font-bold text-red-500 mb-4">
                                Chapter {groupIndex + 1}: {chapterGroup.chapterName}
                            </h3>

                            {/* Questions for the Chapter */}
                            <ul className="space-y-4">
                                {chapterGroup.questions.map((item, index) => (
                                    <li
                                        key={index}
                                        className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        {/* Question Text */}
                                        <h4 className="font-semibold text-gray-800 mb-2">
                                            Question {index + 1}: {item.question}
                                        </h4>

                                        {/* Options */}
                                        <ul className="pl-4 space-y-2">
                                            {item.options?.map((option, optionIndex) => (
                                                <li key={optionIndex} className="text-gray-600 hover:text-gray-800 transition-all">
                                                    {String.fromCharCode(65 + optionIndex)}. {option}
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Correct Answer */}
                                        <p className="mt-3 text-green-600 font-medium">
                                            Answer: {item.answer}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            ) : (
                // No Question Data
                <div className="text-center text-gray-500">No questions available.</div>
            )}
        </div>
    );
};

export default QuestionWindow;