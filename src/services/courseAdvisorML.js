// Course Advisor ML Service
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];

const UNIVERSITIES = [
  {
    name: 'University of Lagos',
    location: 'Lagos',
    courses: {
      'Medicine and Surgery': { cutoff: 280, requirements: ['English: B2', 'Mathematics: C4', 'Biology: B2', 'Chemistry: B2', 'Physics: C4'] },
      'Computer Engineering': { cutoff: 250, requirements: ['English: C4', 'Mathematics: B2', 'Physics: B2', 'Chemistry: C4'] },
      'Law': { cutoff: 270, requirements: ['English: B2', 'Literature: B2', 'Government: B2', 'CRK/IRK: C4'] },
    }
  },
  {
    name: 'Ahmadu Bello University',
    location: 'Kaduna',
    courses: {
      'Medicine and Surgery': { cutoff: 270, requirements: ['English: B2', 'Mathematics: C4', 'Biology: B2', 'Chemistry: B2', 'Physics: C4'] },
      'Computer Science': { cutoff: 240, requirements: ['English: C4', 'Mathematics: B2', 'Physics: C4', 'Chemistry: C4'] },
      'Agriculture': { cutoff: 200, requirements: ['English: C4', 'Mathematics: C4', 'Biology: C4', 'Chemistry: C4'] },
    }
  },
  {
    name: 'University of Nigeria',
    location: 'Enugu',
    courses: {
      'Pharmacy': { cutoff: 270, requirements: ['English: B2', 'Mathematics: B2', 'Biology: B2', 'Chemistry: B2', 'Physics: C4'] },
      'Engineering': { cutoff: 240, requirements: ['English: C4', 'Mathematics: B2', 'Physics: B2', 'Chemistry: C4'] },
      'Economics': { cutoff: 230, requirements: ['English: C4', 'Mathematics: B2', 'Economics: B2', 'Government: C4'] },
    }
  },
  // Add more universities and their requirements
];

const GRADE_POINTS = {
  'A1': 8,
  'B2': 7,
  'B3': 6,
  'C4': 5,
  'C5': 4,
  'C6': 3,
  'D7': 2,
  'E8': 1,
  'F9': 0
};

class CourseAdvisorML {
  calculateSubjectScore(grade) {
    return GRADE_POINTS[grade] || 0;
  }

  calculateAverageScore(subjects) {
    const grades = Object.values(subjects);
    const totalPoints = grades.reduce((sum, grade) => sum + this.calculateSubjectScore(grade), 0);
    return totalPoints / grades.length;
  }

  getCatchmentAreaBonus(stateOfOrigin, universityLocation) {
    // Implement catchment area logic for Nigerian universities
    const catchmentZones = {
      'North': ['Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Sokoto', 'Zamfara', 'Jigawa'],
      'South': ['Lagos', 'Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti'],
      'East': ['Abia', 'Anambra', 'Ebonyi', 'Enugu', 'Imo'],
      'West': ['Delta', 'Edo', 'Rivers', 'Bayelsa', 'Cross River', 'Akwa Ibom'],
      'Central': ['Benue', 'Kogi', 'Kwara', 'Niger', 'Plateau', 'Nasarawa', 'FCT']
    };

    for (const [zone, states] of Object.entries(catchmentZones)) {
      if (states.includes(stateOfOrigin) && states.includes(universityLocation)) {
        return 5; // Bonus points for catchment area
      }
    }
    return 0;
  }

  getMeritScore(jambScore, averageWAECScore, catchmentBonus) {
    // Calculate merit score based on JAMB (70%) and WAEC (30%) + catchment bonus
    return (jambScore * 0.7) + (averageWAECScore * 30) + catchmentBonus;
  }

  checkCourseEligibility(subjects, courseRequirements) {
    for (const req of courseRequirements) {
      const [subject, minGrade] = req.split(': ');
      const studentGrade = subjects[subject.toLowerCase()];
      
      if (!studentGrade || GRADE_POINTS[studentGrade] < GRADE_POINTS[minGrade]) {
        return false;
      }
    }
    return true;
  }

  getRecommendations(userInfo) {
    const recommendations = [];
    const averageWAECScore = this.calculateAverageScore(userInfo.subjects);

    for (const university of UNIVERSITIES) {
      const catchmentBonus = this.getCatchmentAreaBonus(userInfo.stateOfOrigin, university.location);
      const meritScore = this.getMeritScore(userInfo.jambScore, averageWAECScore, catchmentBonus);

      for (const [course, details] of Object.entries(university.courses)) {
        if (meritScore >= details.cutoff && this.checkCourseEligibility(userInfo.subjects, details.requirements)) {
          // Calculate course compatibility score
          const baseCompatibility = (meritScore / details.cutoff) * 100;
          const preferenceBonus = userInfo.preferences.some(pref => 
            course.toLowerCase().includes(pref.toLowerCase())) ? 10 : 0;
          
          recommendations.push({
            course,
            university: university.name,
            cutoff: details.cutoff,
            compatibility: Math.min(Math.round(baseCompatibility + preferenceBonus), 100),
            requirements: details.requirements.join(', '),
            meritScore: Math.round(meritScore),
            catchmentBonus
          });
        }
      }
    }

    // Sort by compatibility score and limit to top recommendations
    return recommendations
      .sort((a, b) => b.compatibility - a.compatibility)
      .slice(0, 5);
  }

  validateStateOfOrigin(state) {
    return NIGERIAN_STATES.includes(state);
  }

  validateJambScore(score) {
    return score >= 0 && score <= 400;
  }

  validateSubjectGrade(grade) {
    return grade in GRADE_POINTS;
  }
}

const courseAdvisorML = new CourseAdvisorML();
export default courseAdvisorML; 