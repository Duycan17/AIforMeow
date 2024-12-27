import axios from 'axios';
const BASE_URL = 'http://34.67.28.143:8003';
const CHAPTERS_FROM_FILE = BASE_URL + '/chapters-from-file';
const QUESTIONS_FROM_CHAPTER = BASE_URL + '/questions-from-chapter';
export const getChaptersFromFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post(CHAPTERS_FROM_FILE, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching chapters from file:', error);
        throw error;
    }
};

// Fetches questions from chapter
export const getQuestionsFromChapter = async (chapter, numberOfQuestions, vectorIndexFile) => {
    try {
        const response = await axios.post(QUESTIONS_FROM_CHAPTER, {
            chapter,
            number_of_questions: numberOfQuestions,
            vector_index_file: vectorIndexFile,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching questions from chapter:', error);
        throw error;
    }
};