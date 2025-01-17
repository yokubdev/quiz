class StorageService {
  constructor() {
    this.storageKey = 'quizProgress';
  }

  saveProgress(progress) {
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(progress));
      return true;
    } catch (error) {
      console.error('Failed to save progress:', error);
      return false;
    }
  }

  getProgress() {
    try {
      const savedProgress = sessionStorage.getItem(this.storageKey);
      return savedProgress ? JSON.parse(savedProgress) : null;
    } catch (error) {
      console.error('Failed to load progress:', error);
      return null;
    }
  }

  clearProgress() {
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear progress:', error);
      return false;
    }
  }

  saveResults(results) {
    const blob = new Blob([results], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skin-assessment-results.txt';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export default StorageService;
