import ProgressBar from './ProgressBar.js';

class Question {
  constructor(props) {
    this.props = props;
  }

  render() {
    const { questionData, currentIndex, totalQuestions } = this.props;
    const progressBar = new ProgressBar(currentIndex + 1, totalQuestions);

    return `
      <div class="card">
        ${progressBar.render()}
        <h2>${questionData.question}</h2>
        ${this.renderOptions()}
        ${this.renderAdditionalInput()}
        ${this.renderNavigationButtons()}
      </div>
    `;
  }

  renderOptions() {
    const { questionData, userAnswers, currentIndex } = this.props;
    return `
      <div class="options-container">
        ${questionData.options.map((option, index) => `
          <div class="option ${userAnswers[currentIndex] === index ? 'selected' : ''}"
               data-index="${index}">
            ${option}
          </div>
        `).join('')}
      </div>
    `;
  }

  renderAdditionalInput() {
    const { userAnswers, additionalInput, currentIndex } = this.props;
    const currentAnswer = userAnswers[currentIndex];

    return `
      <div class="additional-input-container">
        ${currentAnswer === 5 ? `
          <div class="additional-input">
            <textarea
              id="specific-concern"
              maxlength="200"
              placeholder="Please specify your concern..."
            >${additionalInput[currentIndex] || ''}</textarea>
            <div class="char-count">Characters: ${(additionalInput[currentIndex] || '').length}/200</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  renderNavigationButtons() {
    const { currentIndex, totalQuestions, editingFromResults } = this.props;
    return `
      <div class="navigation-buttons">
        ${currentIndex > 0 ? `<button id="prev-question" class="btn-secondary">Previous</button>` : ''}
        ${editingFromResults ? `<button id="back-to-results" class="btn-secondary">Back to Results</button>` : ''}
        <button id="next-question" class="btn-primary" disabled>
          ${currentIndex === totalQuestions - 1 ? 'Show Results' : 'Next'}
        </button>
      </div>
    `;
  }

  attachListeners(handlers) {
    this.attachOptionListeners(handlers.onAnswer);
    this.attachNavigationListeners(handlers);
    this.attachAdditionalInputListener(handlers.onAnswer);
  }

  attachOptionListeners(onAnswer) {
    const options = document.querySelectorAll('.option');

    options.forEach(option => {
      option.addEventListener('click', (e) => {
        options.forEach(opt => opt.classList.remove('selected'));

        option.classList.add('selected');

        const answerIndex = parseInt(option.dataset.index);
        onAnswer(answerIndex);

        const additionalInputContainer = document.querySelector('.additional-input-container');
        if (additionalInputContainer) {
          additionalInputContainer.innerHTML = this.renderAdditionalInput();
        }

        if (answerIndex === 5) {
          this.attachAdditionalInputListener(onAnswer);
        }
      });
    });
  }

  attachNavigationListeners(handlers) {
    const { onNext, onPrevious, onBackToResults } = handlers;
    const nextButton = document.getElementById('next-question');
    const prevButton = document.getElementById('prev-question');
    const backButton = document.getElementById('back-to-results');

    if (nextButton) {
      nextButton.addEventListener('click', onNext);
      const { userAnswers, currentIndex, additionalInput } = this.props;
      const currentAnswer = userAnswers[currentIndex];
      nextButton.disabled = currentAnswer === undefined ||
        (currentAnswer === 5 && (!additionalInput[currentIndex] || !additionalInput[currentIndex].trim()));
    }

    if (prevButton) {
      prevButton.addEventListener('click', onPrevious);
    }

    if (backButton) {
      backButton.addEventListener('click', (e) => {
        e.preventDefault();
        onBackToResults();
      });
    }
  }

  attachAdditionalInputListener(onAnswer) {
    const textarea = document.getElementById('specific-concern');
    if (textarea) {
      textarea.addEventListener('input', (e) => {
        const { currentIndex } = this.props;
        onAnswer(5, e.target.value);

        // Update character count
        const charCount = document.querySelector('.char-count');
        if (charCount) {
          charCount.textContent = `Characters: ${e.target.value.length}/200`;
        }
      });
    }
  }
}

export default Question;
