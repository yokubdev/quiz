class QuizService {
  constructor() {
    this.quizData = null;
  }

  async loadQuizData() {
    try {
      const response = await fetch('./src/config/quiz.json');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.quizData = await response.json();

      if (!this.quizData || !this.quizData.steps) {
        throw new Error('Invalid quiz data format');
      }

      return this.quizData;
    } catch (error) {
      console.error('Error loading quiz data:', error);
      throw new Error(`Failed to load quiz data: ${error.message}`);
    }
  }

  validateAnswer(answer, additionalInput, totalOptions) {
    if (answer === totalOptions - 1 && (!additionalInput || additionalInput.trim() === '')) {
      return false;
    }
    return answer !== undefined;
  }

  getWelcomeData() {
    return this.quizData?.welcomePage;
  }

  getQuestion(index) {
    return this.quizData?.steps[index];
  }

  getTotalQuestions() {
    return this.quizData?.steps.length || 0;
  }

  getQuizData() {
    return this.quizData;
  }

  validateAnswer(answer, additionalInput) {
    if (answer === 5 && (!additionalInput || additionalInput.trim() === '')) {
      return false;
    }
    return answer !== undefined;
  }

  isLastQuestion(currentIndex) {
    return currentIndex === this.getTotalQuestions() - 1;
  }

  formatResultsForSave(steps, userAnswers, additionalInput) {
    return steps.map((step, index) =>
      `${step.question}: ${step.options[userAnswers[index]]}${
        userAnswers[index] === 5 ? '\nAdditional Input: ' + (additionalInput[index] || '') : ''
      }`
    ).join('\n\n');
  }
}

export default QuizService;
