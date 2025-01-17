export const handleVisibilityChange = (quiz) => {
  if (document.visibilityState === 'hidden') {
    quiz.saveProgress();
  }
};

export const handleBeforeUnload = (quiz) => {
  quiz.saveProgress();
};

export const validateAnswer = (answer, additionalInput) => {
  if (answer === 5 && (!additionalInput || additionalInput.trim() === '')) {
    return false;
  }
  return answer !== undefined;
};

export const formatProgress = (currentStep, totalSteps) => {
  return Math.round((currentStep / totalSteps) * 100);
};
