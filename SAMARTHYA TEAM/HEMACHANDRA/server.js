const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const mongoose = require('mongoose');
const { Quiz } = require('./models');

const app = express();
const PORT = 5005;

// Your HuggingFace API Key (not used yet for demo)
const HF_API_KEY = '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';

// Connect to MongoDB
mongoose.connect('mongodb://Hemachandra:Hemachandra1!@ac-bvy31wv-shard-00-00.wsvfha9.mongodb.net:27017,ac-bvy31wv-shard-00-01.wsvfha9.mongodb.net:27017,ac-bvy31wv-shard-00-02.wsvfha9.mongodb.net:27017/?replicaSet=atlas-wumbjs-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to get a complete sentence or phrase
const getTruncatedSentence = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  
  // Find a good breaking point - preferably at the end of a sentence or phrase
  let breakPoint = maxLength;
  const punctuationBreaks = ['. ', '? ', '! ', '; ', ', '];
  
  for (const punct of punctuationBreaks) {
    const lastIndex = text.lastIndexOf(punct, maxLength);
    if (lastIndex > 0) {
      breakPoint = lastIndex + punct.length - 1;
      break;
    }
  }
  
  // If no good breaking point was found, try to break at a space
  if (breakPoint === maxLength) {
    const lastSpace = text.lastIndexOf(' ', maxLength);
    if (lastSpace > 0) {
      breakPoint = lastSpace;
    }
  }
  
  return text.substring(0, breakPoint + 1) + (breakPoint < text.length - 1 ? "..." : "");
};

app.post('/generate-quiz', async (req, res) => {
    const { syllabus, teacherName } = req.body;
    
    if (!teacherName) {
      return res.status(400).json({ error: "Teacher name is required" });
    }
  
    const topics = syllabus
      .split(/[.?!\n]/)
      .filter(s => s.trim().length > 10)
      .slice(0, 10);
  
    // Question type templates
    const questionTemplates = [
      (topic) => `What is the main concept described in: "${topic}"?`,
      (topic) => `Which statement best summarizes: "${topic}"?`,
      (topic) => `According to the syllabus, what is true about: "${topic}"?`,
      (topic) => `Which of the following best captures the essence of: "${topic}"?`,
      (topic) => `What key point is conveyed in: "${topic}"?`,
      (topic) => `How would you best describe the content of: "${topic}"?`,
      (topic) => `What is being explained when the syllabus states: "${topic}"?`,
      (topic) => `Which interpretation correctly reflects: "${topic}"?`
    ];

    // More varied correct answer templates
    const correctAnswerTemplates = [
      (topic) => `It explains that ${topic}.`,
      (topic) => `The passage describes ${topic}.`,
      (topic) => `This section covers ${topic}.`,
      (topic) => `The text outlines how ${topic}.`,
      (topic) => `This portion details ${topic}.`
    ];

    // More varied distractor templates for wrong answers
    const getDistractors = (topic) => {
      // Extract meaningful parts from the topic
      const words = topic.split(' ');
      const firstHalf = words.slice(0, Math.ceil(words.length / 2)).join(' ');
      const secondHalf = words.slice(Math.ceil(words.length / 2)).join(' ');
      
      const possibleDistractors = [
        `It discusses the history of concepts that are unrelated to ${topic}.`,
        `It introduces fundamentals that contradict what is stated about ${firstHalf}.`,
        `It compares different topics not mentioned in the syllabus.`,
        `It contradicts the main points about ${firstHalf}.`,
        `It focuses on advanced applications rather than the fundamental concepts described.`,
        `It examines opposing viewpoints to what is presented in the text.`,
        `It presents outdated information contrary to current understanding.`,
        `It provides examples that aren't relevant to the topic.`,
        `It explores theoretical frameworks instead of practical applications.`,
        `It emphasizes implementation details instead of core concepts.`,
        `It analyzes the limitations of approaches not covered in this material.`,
        `It recommends alternative approaches not mentioned in the text.`
      ];
      
      // Randomly select 3 different distractors
      const selected = [];
      while (selected.length < 3) {
        const idx = Math.floor(Math.random() * possibleDistractors.length);
        if (!selected.includes(possibleDistractors[idx])) {
          selected.push(possibleDistractors[idx]);
        }
      }
      
      return selected;
    };
  
    const quizQuestions = topics.map((topic, i) => {
      const trimmed = topic.trim();
      
      // Create a properly truncated question text (if needed)
      const shortText = getTruncatedSentence(trimmed, 100);
      
      // Select a random question template
      const questionTemplate = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
      const question = questionTemplate(shortText);
      
      // Select a random correct answer template
      const correctAnswerTemplate = correctAnswerTemplates[Math.floor(Math.random() * correctAnswerTemplates.length)];
      const correctAnswer = correctAnswerTemplate(trimmed);
      
      // Get 3 varied distractors
      const distractors = getDistractors(trimmed);
      
      // Shuffle correct + distractors
      const options = [...distractors];
      const correctIndex = Math.floor(Math.random() * 4);
      options.splice(correctIndex, 0, correctAnswer);
      
      return {
        question,
        options: options.map((opt, idx) => ({
          text: opt,
          isCorrect: idx === correctIndex
        })),
        correctIndex
      };
    });

    // Prepare output for response
    const questions = quizQuestions.map(q => ({
      question: q.question,
      options: q.options.map(opt => opt.text),
      correctIndex: q.correctIndex
    }));
    
    try {
      // Create a new quiz in the database
      const newQuiz = new Quiz({
        teacherName,
        syllabus,
        questions: quizQuestions.map(q => ({
          question: q.question,
          options: q.options
        }))
      });
      
      await newQuiz.save();
      
      res.json({ 
        questions,
        quizId: newQuiz._id
      });
    } catch (error) {
      console.error('Error saving quiz to database:', error);
      res.status(500).json({ error: 'Failed to save quiz to database' });
    }
});

// New endpoint to get all quizzes by teacher name
app.get('/quizzes/:teacherName', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ teacherName: req.params.teacherName });
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Get a specific quiz by ID
app.get('/quiz/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});