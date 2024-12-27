import React, { useState } from 'react';
import './App.css';
import QuestionWindow from './components/QuestionWindow';
import { getChaptersFromFile, getQuestionsFromChapter } from './services/services';
import { ClipLoader } from 'react-spinners';
import { Upload, FileText, ChevronRight, X, Trash2 } from 'lucide-react';


function App() {
  const [questions, setQuestions] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [fileIndex, setFileIndex] = useState(0);
  const [chaptersForCurrentFile, setChaptersForCurrentFile] = useState([]);
  const [chapterQuestionsCount, setChapterQuestionsCount] = useState({});
  const [loading, setLoading] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [vectorIndexFiles, setVectorIndexFiles] = useState([]);

  // Previous handlers remain unchanged...
  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setLoading(true);
      try {
        const uploadedFiles = Array.from(files);
        setAllFiles(uploadedFiles);
        const firstFile = uploadedFiles[0];
        const chaptersResponse = await getChaptersFromFile(firstFile);
        const { chapters, vector_index_file } = chaptersResponse;
        const uniqueChapters = [...new Set(chapters)];
        setChaptersForCurrentFile(uniqueChapters.map((chapter) => ({ chapterName: chapter })));
        setVectorIndexFiles([{ fileName: firstFile.name, vector_index_file }]);
        const defaultQuestionsCount = {};
        uniqueChapters.forEach((chapter) => { defaultQuestionsCount[chapter] = 5; });
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
    setSyllabusFile(file);
  };

  const handleNextFile = async () => {
    const nextIndex = fileIndex + 1;
    if (nextIndex < allFiles.length) {
      setLoading(true);
      try {
        const nextFile = allFiles[nextIndex];
        const chaptersResponse = await getChaptersFromFile(nextFile);
        const { chapters, vector_index_file } = chaptersResponse;
        const uniqueChapters = [...new Set(chapters)];
        setChaptersForCurrentFile(uniqueChapters.map((chapter) => ({ chapterName: chapter })));
        setVectorIndexFiles((prev) => [...prev, { fileName: nextFile.name, vector_index_file }]);
        const defaultQuestionsCount = { ...chapterQuestionsCount };
        uniqueChapters.forEach((chapter) => {
          if (!(chapter in defaultQuestionsCount)) defaultQuestionsCount[chapter] = 5;
        });
        setChapterQuestionsCount(defaultQuestionsCount);
        setFileIndex(nextIndex);
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
        const vectorIndexFile = vectorIndexFiles.find((item) => item.fileName === fileName)?.vector_index_file;
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
          chapterQuestions.push({ fileName, chapterName, questions: questionsResponse.questions });
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
    setChapterQuestionsCount((prev) => ({ ...prev, [chapter]: count }));
  };

  const handleCloseQuestions = () => {
    setQuestions([]);
    setShowQuestions(false);
    setFileIndex(0);
  };
  const removeFile = (index) => {
    setAllFiles(files => files.filter((_, i) => i !== index));
    setVectorIndexFiles(files => files.filter((_, i) => i !== index));
    if (fileIndex >= index) {
      setFileIndex(prev => Math.max(0, prev - 1));
    }
    if (allFiles.length === 1) {
      setChaptersForCurrentFile([]);
      setChapterQuestionsCount({});
    }
  };

  const removeSyllabus = () => {
    setSyllabusFile(null);
  };
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Question Generator</h1>
            <p className="text-gray-600">Upload your documents to generate questions</p>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chapter Files Upload */}
              <div className="space-y-4">
                <div className="relative group">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    id="chapterFileUpload"
                    multiple
                    className="hidden"
                  />
                  <label
                    htmlFor="chapterFileUpload"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer group-hover:border-blue-400"
                  >
                    <Upload className="w-8 h-8 text-blue-500 mb-2" />
                    <span className="text-sm font-medium text-blue-600">Upload Chapter Documents</span>
                    <span className="text-xs text-gray-500 mt-1">Multiple files supported</span>
                  </label>
                </div>

                {/* Uploaded Chapter Files List */}
                {allFiles.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h3>
                    <div className="space-y-2">
                      {allFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md">
                          <span className="text-sm text-gray-600 truncate">{file.name}</span>
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 hover:bg-red-100 rounded-full text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Syllabus Upload */}
              <div className="space-y-4">
                <div className="relative group">
                  <input
                    type="file"
                    onChange={handleSyllabusUpload}
                    id="syllabusUpload"
                    className="hidden"
                  />
                  <label
                    htmlFor="syllabusUpload"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-green-300 rounded-xl bg-green-50 hover:bg-green-100 transition-colors cursor-pointer group-hover:border-green-400"
                  >
                    <FileText className="w-8 h-8 text-green-500 mb-2" />
                    <span className="text-sm font-medium text-green-600">Upload Syllabus</span>
                    <span className="text-xs text-gray-500 mt-1">Single file</span>
                  </label>
                </div>

                {/* Uploaded Syllabus File */}
                {syllabusFile && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Syllabus:</h3>
                    <div className="flex items-center justify-between bg-white p-2 rounded-md">
                      <span className="text-sm text-gray-600 truncate">{syllabusFile.name}</span>
                      <button
                        onClick={removeSyllabus}
                        className="p-1 hover:bg-red-100 rounded-full text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chapter Configuration */}
          {chaptersForCurrentFile.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Configure Questions for "{allFiles[fileIndex]?.name}"
                </h2>
                <span className="text-sm text-gray-500">
                  File {fileIndex + 1} of {allFiles.length}
                </span>
              </div>

              <div className="space-y-4">
                {chaptersForCurrentFile.map(({ chapterName }, index) => (
                  <div key={index}
                    className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="flex-grow font-medium text-gray-700">{chapterName}</span>
                    <input
                      type="number"
                      min="1"
                      value={chapterQuestionsCount[chapterName]}
                      onChange={(e) => handleQuestionCountChange(chapterName, Number(e.target.value))}
                      className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                {fileIndex < allFiles.length - 1 ? (
                  <button
                    onClick={handleNextFile}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next File
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleFetchQuestions}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Generate Questions
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay - Moved outside main container */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl flex items-center space-x-4">
            <ClipLoader color="#4F46E5" size={30} />
            <span className="text-gray-800 font-medium">Processing...</span>
          </div>
        </div>
      )}

      {/* Questions Display - Moved outside main container */}
      {showQuestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Generated Questions</h3>
              <button
                onClick={handleCloseQuestions}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <QuestionWindow questions={questions} onClose={handleCloseQuestions} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;