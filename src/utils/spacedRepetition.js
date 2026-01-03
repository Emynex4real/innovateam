/**
 * Spaced Repetition System (SRS) - SuperMemo-2 Algorithm
 * Used by Anki, Duolingo, and other top learning apps
 */

export const calculateNextReview = (mastery) => {
  const { consecutive_correct = 0, ease_factor = 2.5, interval_days = 1 } = mastery;
  
  // First time wrong: review tomorrow
  if (consecutive_correct === 0) {
    return { 
      interval: 1, 
      ease: ease_factor,
      nextReviewDate: addDays(new Date(), 1)
    };
  }
  
  // Second time correct: review in 6 days
  if (consecutive_correct === 1) {
    return { 
      interval: 6, 
      ease: ease_factor,
      nextReviewDate: addDays(new Date(), 6)
    };
  }
  
  // Subsequent reviews: multiply by ease factor
  const newInterval = Math.round(interval_days * ease_factor);
  return { 
    interval: newInterval, 
    ease: ease_factor,
    nextReviewDate: addDays(new Date(), newInterval)
  };
};

export const updateEaseFactor = (currentEase, quality) => {
  // quality: 0-5 scale
  // 0 = complete blackout
  // 3 = correct with difficulty
  // 5 = perfect recall
  const newEase = currentEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  return Math.max(1.3, newEase); // Minimum ease factor
};

export const calculateQuality = (isCorrect, timeSpent, avgTime) => {
  if (!isCorrect) return 0;
  
  // Fast and correct = perfect recall (5)
  if (timeSpent < avgTime * 0.5) return 5;
  
  // Normal speed = good recall (4)
  if (timeSpent < avgTime) return 4;
  
  // Slow but correct = difficult recall (3)
  return 3;
};

export const getMasteryLevel = (consecutive_correct) => {
  if (consecutive_correct >= 5) return 'mastered';
  if (consecutive_correct >= 3) return 'familiar';
  if (consecutive_correct >= 1) return 'learning';
  return 'new';
};

export const getMasteryColor = (level) => {
  const colors = {
    mastered: 'text-green-600 bg-green-50',
    familiar: 'text-blue-600 bg-blue-50',
    learning: 'text-yellow-600 bg-yellow-50',
    new: 'text-gray-600 bg-gray-50'
  };
  return colors[level] || colors.new;
};

// Helper function
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const sortQuestionsByPriority = (questions, masteryData) => {
  return questions.sort((a, b) => {
    const masteryA = masteryData[a.id] || { next_review_date: new Date(0) };
    const masteryB = masteryData[b.id] || { next_review_date: new Date(0) };
    
    const now = new Date();
    const overdueA = now - new Date(masteryA.next_review_date);
    const overdueB = now - new Date(masteryB.next_review_date);
    
    // Overdue questions first
    if (overdueA > 0 && overdueB <= 0) return -1;
    if (overdueB > 0 && overdueA <= 0) return 1;
    
    // Then by how overdue
    return overdueB - overdueA;
  });
};
