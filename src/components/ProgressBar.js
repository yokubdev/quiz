class ProgressBar {
  constructor(currentStep, totalSteps) {
    this.currentStep = currentStep;
    this.totalSteps = totalSteps;
  }

  render() {
    const progress = (this.currentStep / this.totalSteps) * 100;
    return `
      <div class="progress-bar">
        <div class="progress-bar__fill" style="width: ${progress}%"></div>
      </div>
      <p class="question-counter">Question ${this.currentStep} of ${this.totalSteps}</p>
    `;
  }
}

export default ProgressBar;
