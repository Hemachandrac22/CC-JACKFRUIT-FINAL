const mongoose = require('mongoose');

// Define the schema for quiz options
const optionSchema = new mongoose.Schema({
  text: String,
  isCorrect: Boolean
});

// Define the schema for quiz questions
const questionSchema = new mongoose.Schema({
  question: String,
  options: [optionSchema]
});

// Define the schema for quizzes
const quizSchema = new mongoose.Schema({
  teacherName: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  syllabus: {
    type: String,
    required: true
  },
  questions: [questionSchema]
});

// Create and export the Quiz model
const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = { Quiz };