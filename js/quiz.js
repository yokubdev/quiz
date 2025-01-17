class SkinTypeQuiz {
  constructor() {
    this.questions = quizQuestions; // Using the global quizQuestions array
    this.currentQuestionIndex = 0;
    this.userAnswers = [];
    this.quizContainer = document.getElementById('quiz-container');
    this.initializeQuiz();
  }

  initializeQuiz() {
    this.renderWelcomeScreen();
  }

  renderWelcomeScreen() {
    const welcomeHTML = `
      <div class="card">
        <h1>Skin Type Quiz</h1>
        <p>Discover your skin type and get personalized recommendations.</p>
        <button class="btn-primary" id="start-quiz">Start Quiz</button>
      </div>
    `;
    this.quizContainer.innerHTML = welcomeHTML;

    document.getElementById('start-quiz')
      .addEventListener('click', () => this.renderQuestion());
  }

  renderQuestion() {
    const question = this.questions[this.currentQuestionIndex];
    const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;

    const questionHTML = `
      <div class="card">
        <div class="progress-bar">
          <div class="progress" style="width: ${progress}%"></div>
        </div>
        <h2>Question ${this.currentQuestionIndex + 1} of ${this.questions.length}</h2>
        <p>${question.question}</p>
        <div class="options">
          ${question.options.map((option, index) => `
            <div class="option ${this.userAnswers[this.currentQuestionIndex] === index ? 'selected' : ''}"
                 data-index="${index}">
              ${option}
            </div>
          `).join('')}
        </div>
        <div class="navigation">
          ${this.currentQuestionIndex > 0 ?
            `<button class="btn-secondary" id="prev-question">Previous</button>` :
            ''}
          <button class="btn-primary" id="next-question"
                  ${this.userAnswers[this.currentQuestionIndex] === undefined ? 'disabled' : ''}>
            ${this.currentQuestionIndex === this.questions.length - 1 ? 'See Results' : 'Next'}
          </button>
        </div>
      </div>
    `;

    this.quizContainer.innerHTML = questionHTML;
    this.attachQuestionListeners();
  }

  attachQuestionListeners() {
    // Option selection
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
      option.addEventListener('click', () => {
        options.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');

        const answerIndex = parseInt(option.dataset.index);
        this.userAnswers[this.currentQuestionIndex] = answerIndex;

        const nextButton = document.getElementById('next-question');
        if (nextButton) nextButton.disabled = false;
      });
    });

    // Navigation
    const prevButton = document.getElementById('prev-question');
    const nextButton = document.getElementById('next-question');

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        this.currentQuestionIndex--;
        this.renderQuestion();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        if (this.currentQuestionIndex === this.questions.length - 1) {
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
      <div class="card">
        <h2>Your Skin Type Results</h2>
        <div class="results-content">
          ${this.calculateResults()}
        </div>
        <div class="action-buttons">
          <button class="btn-secondary" id="edit-answers">Edit Answers</button>
          <button class="btn-secondary" id="retake-quiz">Retake Quiz</button>
          <button class="btn-primary" id="share-results">Share Results</button>
          <button class="btn-primary" id="print-results">Print Results</button>
        </div>
      </div>
    `;

    this.quizContainer.innerHTML = resultsHTML;
    this.attachResultsListeners();
  }

  calculateResults() {
    // Simple example - you can expand this based on your scoring logic
    const skinTypes = ['Dry', 'Normal', 'Oily', 'Combination'];
    const scores = [0, 0, 0, 0];

    this.userAnswers.forEach((answer, index) => {
      scores[answer % 4]++;
    });

    const maxScore = Math.max(...scores);
    const skinType = skinTypes[scores.indexOf(maxScore)];

    return `
      <p>Based on your answers, your skin type appears to be: <strong>${skinType}</strong></p>
      <p>Here are some recommendations for your skin type...</p>
    `;
  }

  attachResultsListeners() {
    document.getElementById('edit-answers')?.addEventListener('click', () => {
      this.currentQuestionIndex = 0;
      this.renderQuestion();
    });

    document.getElementById('retake-quiz')?.addEventListener('click', () => {
      this.currentQuestionIndex = 0;
      this.userAnswers = [];
      this.renderWelcomeScreen();
    });

    document.getElementById('share-results')?.addEventListener('click', () => {
      alert('Sharing functionality coming soon!');
    });

    document.getElementById('print-results')?.addEventListener('click', () => {
      window.print();
    });
  }
}

// Initialize the quiz when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new SkinTypeQuiz();
});
