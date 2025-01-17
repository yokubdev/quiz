class Results {
  constructor(props) {
    this.quizData = props.quizData;
    this.userAnswers = props.userAnswers;
    this.additionalInput = props.additionalInput;
  }

  render() {
    return `
      <div class="card results">
        <h2>Your Skin Assessment Results</h2>
        <div class="results-summary">
          ${this.renderResultItems()}
        </div>
        <div class="action-buttons">
          <button id="retake-quiz" class="btn-secondary">Retake Quiz</button>
          <button id="save-results" class="btn-primary">Save Results</button>
        </div>
        ${this.renderSocialShare()}
      </div>
    `;
  }

  renderResultItems() {
    return this.quizData.steps.map((step, index) => `
      <div class="result-item">
        <h3>${step.question}</h3>
        <p>${step.options[this.userAnswers[index]]}
           ${this.userAnswers[index] === 5 ?
             `<br><em>${this.additionalInput[index] || ''}</em>` : ''}
        </p>
        <button class="btn-secondary edit-answer" data-question="${index}">Edit</button>
      </div>
    `).join('');
  }

  renderSocialShare() {
    return `
      <div class="social-share">
        <button class="share-facebook">Share on Facebook</button>
        <button class="share-twitter">Share on Twitter</button>
        <button class="share-email">Share via Email</button>
      </div>
    `;
  }

  attachListeners(handlers) {
    const { onEdit, onRetake, onSave } = handlers;

    document.querySelectorAll('.edit-answer').forEach(button => {
      button.addEventListener('click', (e) => {
        onEdit(parseInt(e.target.dataset.question));
      });
    });

    document.getElementById('retake-quiz').addEventListener('click', onRetake);
    document.getElementById('save-results').addEventListener('click', onSave);
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
}

export default Results;
