import axios from 'axios';
const BASE_URL = 'http://34.67.28.143:8003'
const API_URL = BASE_URL + '/generate-questions';
const API_URL_QUESTIONS_FROM_IMAGE = BASE_URL + '/questions-from-image';
const API_URL_QUESTIONS_FROM_FILE = BASE_URL + '/questions-from-file';

export const generateQuestions = async (context) => {
    try {
        const response = await axios.post(API_URL, {
            context: context,
        });
        return response.data;
    } catch (error) {
        console.error('Error generating questions:', error);
        throw error;
    }
};
export const generateQuestionsFromImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    try {
        const response = await axios.post(API_URL_QUESTIONS_FROM_IMAGE, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error generating questions from image:', error);
        throw error;
    }
};
export const generateQuestionsFromFile = async (files) => {
    const results = [];
    try {
        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            const response = await axios.post(API_URL_QUESTIONS_FROM_FILE, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            results.push(response.data);
        }

        return results;
    } catch (error) {
        console.error('Error generating questions from file:', error);
        throw error;
    }
};
