class Welcome {
  constructor(welcomeData) {
    this.welcomeData = welcomeData;
  }

  render() {
    return `
      <div class="card welcome-screen">
        <h1>${this.welcomeData.title}</h1>
        <p class="welcome-screen__description">${this.welcomeData.description}</p>
        <div class="welcome-screen__quiz-info">
          <div class="info-item">
            <span class="icon">⏱️</span>
            <p>Time: 2-3 minutes</p>
          </div>
          <div class="info-item">
            <span class="icon">❓</span>
            <p>6 Questions</p>
          </div>
        </div>
        <button class="btn-primary" id="start-quiz">${this.welcomeData.buttonText}</button>
      </div>
    `;
  }

  attachListeners(onStart) {
    document.getElementById('start-quiz').addEventListener('click', onStart);
  }
}

export default Welcome;
