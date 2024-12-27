import React, { useState } from 'react';
import './App.css';
import QuestionWindow from './components/QuestionWindow';
import { getChaptersFromFile, getQuestionsFromChapter } from './services/services';
import BeatLoader from 'react-spinners/ClipLoader';

function App() {
  const [questions, setQuestions] = useState([]);
  const [allFiles, setAllFiles] = useState([]); // Store uploaded files for chapters
  const [syllabusFile, setSyllabusFile] = useState(null); // Store the uploaded syllabus file
  const [fileIndex, setFileIndex] = useState(0); // Current file being processed
  const [chaptersForCurrentFile, setChaptersForCurrentFile] = useState([]);
  const [chapterQuestionsCount, setChapterQuestionsCount] = useState({});
  const [loading, setLoading] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [vectorIndexFiles, setVectorIndexFiles] = useState([]); // Store vector_index_file for each file

  const handleFileUpload = async (event) => {
    const files = event.target.files;

    if (files && files.length > 0) {
      setLoading(true);

      try {
        const uploadedFiles = Array.from(files);
        setAllFiles(uploadedFiles); // Store all uploaded chapter files

        // Process the first file immediately
        const firstFile = uploadedFiles[0];
        const chaptersResponse = await getChaptersFromFile(firstFile);
        const { chapters, vector_index_file } = chaptersResponse;

        setChaptersForCurrentFile(
            chapters.map((chapter) => ({
              chapterName: chapter,
            }))
        );

        setVectorIndexFiles([{ fileName: firstFile.name, vector_index_file }]); // Add vector index for the first file

        const defaultQuestionsCount = {};
        chapters.forEach((chapter) => {
          defaultQuestionsCount[chapter] = 5; // Default to 5 questions per chapter
        });
        setChapterQuestionsCount(defaultQuestionsCount);
      } catch (error) {
        console.error('Error processing files:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSyllabusUpload = (event) => {
    const file = event.target.files[0];
    setSyllabusFile(file); // Store the uploaded syllabus file
  };

  const handleNextFile = async () => {
    const nextIndex = fileIndex + 1;

    if (nextIndex < allFiles.length) {
      setLoading(true);

      try {
        const nextFile = allFiles[nextIndex];
        const chaptersResponse = await getChaptersFromFile(nextFile);
        const { chapters, vector_index_file } = chaptersResponse;

        setChaptersForCurrentFile(
            chapters.map((chapter) => ({
              chapterName: chapter,
            }))
        );

        setVectorIndexFiles((prev) => [
          ...prev,
          { fileName: nextFile.name, vector_index_file },
        ]);

        const defaultQuestionsCount = { ...chapterQuestionsCount };
        chapters.forEach((chapter) => {
          if (!(chapter in defaultQuestionsCount)) {
            defaultQuestionsCount[chapter] = 5; // Default to 5 questions per chapter
          }
        });
        setChapterQuestionsCount(defaultQuestionsCount);
        setFileIndex(nextIndex); // Move to the next file in the slice window
      } catch (error) {
        console.error('Error processing file:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFetchQuestions = async () => {
    setLoading(true);

    try {
      const chapterQuestions = [];

      for (let i = 0; i < allFiles.length; i++) {
        const fileName = allFiles[i].name;
        const vectorIndexFile = vectorIndexFiles.find(
            (item) => item.fileName === fileName
        )?.vector_index_file;

        if (!vectorIndexFile) {
          console.error(`Vector index file not found for ${fileName}`);
          continue;
        }

        for (const chapterName of Object.keys(chapterQuestionsCount)) {
          const questionsResponse = await getQuestionsFromChapter(
              chapterName,
              chapterQuestionsCount[chapterName],
              vectorIndexFile
          );

          chapterQuestions.push({
            fileName,
            chapterName,
            questions: questionsResponse.questions,
          });
        }
      }

      setQuestions(chapterQuestions);
      setShowQuestions(true);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionCountChange = (chapter, count) => {
    setChapterQuestionsCount((prev) => ({
      ...prev,
      [chapter]: count, // Update the count for the specific chapter
    }));
  };

  const handleCloseQuestions = () => {
    setQuestions([]);
    setShowQuestions(false);
    setFileIndex(0); // Reset file index for a new session
  };

  return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 p-4 space-y-6">
        <div className="w-3/4 space-y-4">
          <h1 className="text-2xl font-bold text-gray-700">Upload Files</h1>

          {/* Input for uploading multiple chapter files */}
          <div className="flex w-full items-center space-x-4">
            <input
                type="file"
                onChange={handleFileUpload}
                id="chapterFileUpload"
                multiple
                className="hidden"
            />
            <label
                htmlFor="chapterFileUpload"
                className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium shadow-md transition transform hover:scale-105"
            >
              Upload tài liệu chương
            </label>
          </div>

          {/* Input for uploading the syllabus file */}
          <div className="flex w-full items-center space-x-4">
            <input
                type="file"
                onChange={handleSyllabusUpload}
                id="syllabusUpload"
                className="hidden"
            />
            <label
                htmlFor="syllabusUpload"
                className="cursor-pointer bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium shadow-md transition transform hover:scale-105"
            >
              Upload đề cương
            </label>
          </div>
        </div>

        {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 bg-gray-500">
              <BeatLoader color="red" />
            </div>
        )}

        {chaptersForCurrentFile.length > 0 && (
            <div className="w-3/4 p-4 bg-white rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                {`Configure questions for file "${allFiles[fileIndex]?.name || ''}"`}
              </h2>
              <div className="space-y-4">
                {chaptersForCurrentFile.map(({ chapterName }, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <label className="w-1/2 text-gray-600 font-medium">{chapterName}</label>
                      <input
                          type="number"
                          min="1"
                          value={chapterQuestionsCount[chapterName]}
                          onChange={(e) => handleQuestionCountChange(chapterName, Number(e.target.value))}
                          className="w-1/2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          placeholder="Number of questions"
                      />
                    </div>
                ))}
              </div>

              {/* Navigation for files */}
              {fileIndex < allFiles.length - 1 ? (
                  <button
                      onClick={handleNextFile}
                      className="mt-6 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow-md transition duration-300"
                  >
                    Next File
                  </button>
              ) : (
                  <button
                      onClick={handleFetchQuestions}
                      className="mt-6 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md transition duration-300"
                  >
                    Fetch All Questions
                  </button>
              )}
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