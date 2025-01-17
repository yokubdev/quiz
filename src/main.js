import Welcome from './components/Welcome.js';
import Question from './components/Question.js';
import Results from './components/Results.js';
import QuizService from './services/QuizService.js';
import StorageService from './services/StorageService.js';
import { handleVisibilityChange, handleBeforeUnload } from './utils/helpers.js';

class Quiz {
  constructor() {
    this.quizService = new QuizService();
    this.storageService = new StorageService();
    this.currentQuestionIndex = 0;
    this.userAnswers = [];
    this.additionalInput = [];
    this.quizContainer = document.getElementById('quiz-container');
    this.editingFromResults = false;

    this.init();
    this.setupEventListeners();
  }

  async init() {
    try {
      await this.quizService.loadQuizData();
      console.log("quiz data loaded", this.quizService.getWelcomeData());

      this.loadSavedProgress();
      this.initializeQuiz();
    } catch (error) {
      this.handleError('Failed to load quiz data');
    }
  }

  setupEventListeners() {
    document.addEventListener('visibilitychange', () => handleVisibilityChange(this));
    window.addEventListener('beforeunload', () => handleBeforeUnload(this));
  }

  loadSavedProgress() {
    const progress = this.storageService.getProgress();
    if (progress) {
      this.userAnswers = progress.answers;
      this.currentQuestionIndex = progress.currentIndex;
      this.additionalInput = progress.additionalInput;
    }
  }

  saveProgress() {
    this.storageService.saveProgress({
      answers: this.userAnswers,
      currentIndex: this.currentQuestionIndex,
      additionalInput: this.additionalInput
    });
  }

  saveResults() {
    const resultsText = this.quizService.formatResultsForSave(
      this.quizService.getQuizData().steps,
      this.userAnswers,
      this.additionalInput
    );

    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skin-assessment-results.txt';

    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  initializeQuiz() {
    if (this.userAnswers.length > 0) {
      this.showContinuePrompt();
    } else {
      this.renderWelcome();
    }
  }

  renderWelcome() {
    const welcome = new Welcome(this.quizService.getWelcomeData());
    this.quizContainer.innerHTML = welcome.render();
    welcome.attachListeners(() => this.renderQuestion());
  }

  handleBackToResults() {
    const savedProgress = this.storageService.getProgress();

    if (savedProgress) {
      this.userAnswers = savedProgress.answers;
      this.additionalInput = savedProgress.additionalInput;
    }

    this.editingFromResults = false;

    this.showResults();
  }

 renderQuestion() {
  const question = new Question({
    questionData: this.quizService.getQuestion(this.currentQuestionIndex),
    currentIndex: this.currentQuestionIndex,
    totalQuestions: this.quizService.getTotalQuestions(),
    userAnswers: this.userAnswers,
    additionalInput: this.additionalInput,
    editingFromResults: this.editingFromResults
  });

  this.quizContainer.innerHTML = question.render();
  question.attachListeners({
    onAnswer: (answer, additional) => this.handleAnswer(answer, additional),
    onNext: () => this.handleNext(),
    onPrevious: () => this.handlePrevious(),
    onBackToResults: () => this.handleBackToResults()
  });
}

  handleAnswer(answer, additional) {
    this.userAnswers[this.currentQuestionIndex] = answer;

    if (answer === 5) {
      this.additionalInput[this.currentQuestionIndex] = additional || '';
    } else {
      this.additionalInput[this.currentQuestionIndex] = '';
    }

    const nextButton = document.getElementById('next-question');
    if (nextButton) {
      nextButton.disabled = answer === 5 && (!additional || additional.trim() === '');
    }

    this.saveProgress();
  }

  handleNext() {
    if (this.currentQuestionIndex < this.quizService.getTotalQuestions() - 1) {
      this.currentQuestionIndex++;
      this.renderQuestion();
    } else {
      this.showResults();
    }
  }

  handlePrevious() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.renderQuestion();
    }
  }

  validateAndUpdateNextButton() {
    const nextButton = document.getElementById('next-question');
    if (!nextButton) return;

    const currentAnswer = this.userAnswers[this.currentQuestionIndex];
    const currentQuestion = this.quizData.steps[this.currentQuestionIndex];
    const isLastOption = currentAnswer === currentQuestion.options.length - 1;
    const currentAdditionalInput = this.additionalInput[this.currentQuestionIndex];

    if (isLastOption && (!currentAdditionalInput || currentAdditionalInput.trim() === '')) {
      nextButton.disabled = true;
    } else if (currentAnswer !== undefined) {
      nextButton.disabled = false;
    }
  }

  editQuestion(index) {
    this.currentQuestionIndex = index;
    this.editingFromResults = true;
    this.renderQuestion();
  }

  showResults() {
    const results = new Results({
      quizData: this.quizService.getQuizData(),
      userAnswers: this.userAnswers,
      additionalInput: this.additionalInput
    });

    this.quizContainer.innerHTML = results.render();
    results.attachListeners({
      onEdit: (index) => this.editQuestion(index),
      onRetake: () => this.retakeQuiz(),
      onSave: () => this.saveResults()
    });
  }

  handleError(message) {
    this.quizContainer.innerHTML = `
      <div class="card error">
        <h2>Oops!</h2>
        <p>${message}</p>
        <button class="btn-primary" onclick="location.reload()">Try Again</button>
      </div>
    `;
  }
}

export default Quiz;
