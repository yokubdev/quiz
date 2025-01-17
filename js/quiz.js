class SkinTypeQuiz {
  constructor() {
    this.loadQuizData();
    this.currentQuestionIndex = 0;
    this.userAnswers = [];
    this.additionalInput = [];
    this.quizContainer = document.getElementById('quiz-container');
    this.editingFromResults = false;
    this.loadSavedProgress();
  }

  async loadQuizData() {
    try {
      const response = await fetch('js/quiz.json');
      const data = await response.json();
      this.quizData = data;
      this.initializeQuiz();
    } catch (error) {
      this.handleError('Failed to load quiz data');
    }
  }

  loadSavedProgress() {
    const savedProgress = sessionStorage.getItem('quizProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      this.userAnswers = progress.answers;
      this.currentQuestionIndex = progress.currentIndex;
      this.additionalInput = progress.additionalInput || [];
    }
  }

  saveProgress() {
    const progress = {
      answers: this.userAnswers,
      currentIndex: this.currentQuestionIndex,
      additionalInput: this.additionalInput
    };
    sessionStorage.setItem('quizProgress', JSON.stringify(progress));
  }

  initializeQuiz() {
    if (this.userAnswers.length > 0) {
      this.showContinuePrompt();
    } else {
      this.renderWelcomeScreen();
    }
  }

  showContinuePrompt() {
    const promptHTML = `
      <div class="card">
        <h2>Welcome Back!</h2>
        <p>Would you like to continue where you left off?</p>
        <div class="action-buttons">
          <button class="btn-primary" id="continue-quiz">Continue</button>
          <button class="btn-secondary" id="restart-quiz">Start Over</button>
        </div>
      </div>
    `;
    this.quizContainer.innerHTML = promptHTML;

    document.getElementById('continue-quiz').addEventListener('click', () => {
      this.renderQuestion();
    });

    document.getElementById('restart-quiz').addEventListener('click', () => {
      sessionStorage.clear();
      this.userAnswers = [];
      this.currentQuestionIndex = 0;
      this.additionalInput = [];
      this.renderWelcomeScreen();
    });
  }

  renderWelcomeScreen() {
    const welcomeHTML = `
      <div class="card welcome-screen">
        <h1>${this.quizData.welcomePage.title}</h1>
        <p class="welcome-screen__description">${this.quizData.welcomePage.description}</p>
        <div class="welcome-screen__quiz-info">
          <div class="info-item">
            <span class="icon">⏱️</span>
            <p>Time: 2-3 minutes</p>
          </div>
          <div class="info-item">
            <span class="icon">❓</span>
            <p>${this.quizData.steps.length} Questions</p>
          </div>
        </div>
        <button class="btn-primary" id="start-quiz">${this.quizData.welcomePage.buttonText}</button>
      </div>
    `;
    this.quizContainer.innerHTML = welcomeHTML;

    document.getElementById('start-quiz').addEventListener('click', () => this.renderQuestion());
  }

  renderQuestion() {
    const currentStep = this.quizData.steps[this.currentQuestionIndex];
    const progress = ((this.currentQuestionIndex + 1) / this.quizData.steps.length) * 100;

    const questionHTML = `
      <div class="card">
        <div class="progress-bar">
          <div class="progress-bar__fill" style="width: ${progress}%"></div>
        </div>
        <p class="question-counter">Question ${this.currentQuestionIndex + 1} of ${this.quizData.steps.length}</p>
        <h2>${currentStep.question}</h2>
        <div class="options-container">
          ${currentStep.options.map((option, index) => `
            <div class="option ${this.userAnswers[this.currentQuestionIndex] === index ? 'selected' : ''}"
                 data-index="${index}">
              ${option}
            </div>
          `).join('')}
        </div>
        ${this.renderAdditionalInput()}
        <div class="navigation-buttons">
          ${this.currentQuestionIndex > 0 ?
            `<button id="prev-question" class="btn-secondary">Previous</button>` : ''}
          ${this.editingFromResults ?
            `<button id="back-to-results" class="btn-secondary">Back to Results</button>` : ''}
          <button id="next-question" class="btn-primary"
                  ${this.userAnswers[this.currentQuestionIndex] === undefined ? 'disabled' : ''}>
            ${this.isLastQuestion() ? 'Show Results' : 'Next'}
          </button>
        </div>
      </div>
    `;

    this.quizContainer.innerHTML = questionHTML;
    this.attachQuestionListeners();
  }

  renderAdditionalInput() {
    if (this.userAnswers[this.currentQuestionIndex] === 5) { // "None of the above" is always the last option (index 5)
      return `
        <div class="additional-input">
          <textarea id="specific-concern"
                    maxlength="200"
                    placeholder="Please specify your concern..."
                    >${this.additionalInput[this.currentQuestionIndex] || ''}</textarea>
          <div class="char-count">Characters: ${(this.additionalInput[this.currentQuestionIndex] || '').length}/200</div>
        </div>
      `;
    }
    return '';
  }

  isLastQuestion() {
    return this.currentQuestionIndex === this.quizData.steps.length - 1;
  }

  attachQuestionListeners() {
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
      option.addEventListener('click', () => {
        options.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');

        const answerIndex = parseInt(option.dataset.index);
        this.userAnswers[this.currentQuestionIndex] = answerIndex;

        if (answerIndex !== 5) {
          this.additionalInput[this.currentQuestionIndex] = '';
        }

        this.renderQuestion();

        const nextButton = document.getElementById('next-question');
        if (nextButton) nextButton.disabled = false;
      });
    });

    const textarea = document.getElementById('specific-concern');
    if (textarea) {
      textarea.addEventListener('input', (e) => {
        this.additionalInput[this.currentQuestionIndex] = e.target.value;
        const charCount = document.querySelector('.char-count');
        if (charCount) {
          charCount.textContent = `Characters: ${this.additionalInput[this.currentQuestionIndex].length}/200`;
        }
      });
    }

    this.attachNavigationListeners();
  }

  attachNavigationListeners() {
    const prevButton = document.getElementById('prev-question');
    const nextButton = document.getElementById('next-question');
    const backToResultsButton = document.getElementById('back-to-results');

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        this.currentQuestionIndex--;
        this.renderQuestion();
      });
    }

    if (backToResultsButton) {
      backToResultsButton.addEventListener('click', () => {
        this.editingFromResults = false;
        this.showResults();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        if (this.isLastQuestion()) {
          this.editingFromResults = false;
          this.showResults();
        } else {
          this.currentQuestionIndex++;
          this.renderQuestion();
        }
      });
    }
  }

  showResults() {
    const resultsHTML = `
      <div class="card results">
        <h2>Your Skin Assessment Results</h2>
        <div class="results-summary">
          ${this.quizData.steps.map((step, index) => `
            <div class="result-item">
              <h3>${step.question}</h3>
              <p>${step.options[this.userAnswers[index]]}
                 ${this.userAnswers[index] === 5 ?
                   `<br><em>${this.additionalInput[index] || ''}</em>` : ''}
              </p>
              <button class="btn-secondary edit-answer" data-question="${index}">Edit</button>
            </div>
          `).join('')}
        </div>
        <div class="action-buttons">
          <button id="retake-quiz" class="btn-secondary">Retake Quiz</button>
          <button id="save-results" class="btn-primary">Save Results</button>
        </div>
        <div class="social-share">
          <button class="share-facebook">Share on Facebook</button>
          <button class="share-twitter">Share on Twitter</button>
          <button class="share-email">Share via Email</button>
        </div>
      </div>
    `;

    this.quizContainer.innerHTML = resultsHTML;
    this.attachResultsListeners();
  }

  attachResultsListeners() {
    document.querySelectorAll('.edit-answer').forEach(button => {
      button.addEventListener('click', (e) => {
        this.editingFromResults = true;
        this.currentQuestionIndex = parseInt(e.target.dataset.question);
        this.renderQuestion();
      });
    });

    document.getElementById('retake-quiz').addEventListener('click', () => {
      this.userAnswers = [];
      this.currentQuestionIndex = 0;
      this.additionalInput = [];
      sessionStorage.clear();
      this.renderWelcomeScreen();
    });

    document.getElementById('save-results').addEventListener('click', () => {
      this.saveResults();
    });

    this.attachSocialShareListeners();
  }

  attachSocialShareListeners() {
    const shareData = {
      title: 'My Skin Type Results',
      text: 'Check out my skin type assessment results!',
      url: window.location.href
    };

    document.querySelector('.share-facebook').addEventListener('click', () => {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`);
    });

    document.querySelector('.share-twitter').addEventListener('click', () => {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(window.location.href)}`);
    });

    document.querySelector('.share-email').addEventListener('click', () => {
      window.location.href = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + '\n' + window.location.href)}`;
    });
  }

  saveResults() {
    const resultsText = this.quizData.steps.map((step, index) =>
      `${step.question}: ${step.options[this.userAnswers[index]]}${
        this.userAnswers[index] === 5 ? '\nAdditional Input: ' + (this.additionalInput[index] || '') : ''
      }`
    ).join('\n\n');

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

  handleError(message) {
    const errorHTML = `
      <div class="card error">
        <h2>Oops!</h2>
        <p>${message}</p>
        <button class="btn-primary" onclick="location.reload()">Try Again</button>
      </div>
    `;
    this.quizContainer.innerHTML = errorHTML;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    const quiz = window.quizInstance;
    if (quiz) {
      quiz.saveProgress();
    }
  }
});

window.addEventListener('beforeunload', () => {
  const quiz = window.quizInstance;
  if (quiz) {
    quiz.saveProgress();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  window.quizInstance = new SkinTypeQuiz();
});
