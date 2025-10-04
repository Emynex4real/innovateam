import { Matrix } from 'ml-matrix';
import { SimpleLinearRegression, MultivariateLinearRegression } from 'ml-regression';
import { mean, standardDeviation } from 'simple-statistics';

// FUTA Course Database with detailed requirements
export const FUTA_COURSES = {
  "Computer Science": {
    faculty: "School of Computing",
    cutoff: 200,
    requirements: {
      utme: ["English Language", "Mathematics", "Physics", "Chemistry/Biology/Economics/Geography"],
      olevel: {
        "English Language": "C6",
        "Mathematics": "C6", 
        "Physics": "C6",
        "Chemistry": "C6"
      }
    },
    capacity: 120,
    competitiveness: 0.85,
    career_prospects: ["Software Developer", "Data Scientist", "Cybersecurity Analyst", "AI Engineer"],
    interests: ["Technology & Innovation", "Problem Solving", "Programming"]
  },
  "Software Engineering": {
    faculty: "School of Computing",
    cutoff: 195,
    requirements: {
      utme: ["English Language", "Mathematics", "Physics", "Chemistry/Biology/Economics"],
      olevel: {
        "English Language": "C6",
        "Mathematics": "C6",
        "Physics": "C6",
        "Chemistry": "C6"
      }
    },
    capacity: 80,
    competitiveness: 0.82,
    career_prospects: ["Software Engineer", "Systems Architect", "DevOps Engineer"],
    interests: ["Technology & Innovation", "Engineering & Design"]
  },
  "Cyber Security": {
    faculty: "School of Computing", 
    cutoff: 190,
    requirements: {
      utme: ["English Language", "Mathematics", "Physics", "Chemistry/Biology/Economics"],
      olevel: {
        "English Language": "C6",
        "Mathematics": "C6",
        "Physics": "C6",
        "Chemistry": "C6"
      }
    },
    capacity: 60,
    competitiveness: 0.88,
    career_prospects: ["Cybersecurity Analyst", "Ethical Hacker", "Security Consultant"],
    interests: ["Technology & Innovation", "Problem Solving"]
  },
  "Information Technology": {
    faculty: "School of Computing",
    cutoff: 185,
    requirements: {
      utme: ["English Language", "Mathematics", "Physics", "Chemistry/Biology/Economics"],
      olevel: {
        "English Language": "C6",
        "Mathematics": "C6",
        "Physics": "C6"
      }
    },
    capacity: 100,
    competitiveness: 0.75,
    career_prospects: ["IT Specialist", "Network Administrator", "Database Administrator"],
    interests: ["Technology & Innovation", "Business & Management"]
  },
  "Mechanical Engineering": {
    faculty: "School of Engineering Technology",
    cutoff: 210,
    requirements: {
      utme: ["English Language", "Mathematics", "Physics", "Chemistry"],
      olevel: {
        "English Language": "C6",
        "Mathematics": "C6",
        "Physics": "C6",
        "Chemistry": "C6",
        "Technical Drawing": "C6"
      }
    },
    capacity: 150,
    competitiveness: 0.90,
    career_prospects: ["Mechanical Engineer", "Design Engineer", "Manufacturing Engineer"],
    interests: ["Engineering & Design", "Problem Solving"]
  },
  "Electrical/Electronics Engineering": {
    faculty: "School of Engineering Technology",
    cutoff: 215,
    requirements: {
      utme: ["English Language", "Mathematics", "Physics", "Chemistry"],
      olevel: {
        "English Language": "C6",
        "Mathematics": "C6",
        "Physics": "C6",
        "Chemistry": "C6",
        "Technical Drawing": "C6"
      }
    },
    capacity: 140,
    competitiveness: 0.92,
    career_prospects: ["Electrical Engineer", "Electronics Engineer", "Power Systems Engineer"],
    interests: ["Engineering & Design", "Technology & Innovation"]
  },
  "Civil Engineering": {
    faculty: "School of Engineering Technology",
    cutoff: 205,
    requirements: {
      utme: ["English Language", "Mathematics", "Physics", "Chemistry"],
      olevel: {
        "English Language": "C6",
        "Mathematics": "C6",
        "Physics": "C6",
        "Chemistry": "C6",
        "Technical Drawing": "C6"
      }
    },
    capacity: 130,
    competitiveness: 0.88,
    career_prospects: ["Civil Engineer", "Structural Engineer", "Construction Manager"],
    interests: ["Engineering & Design", "Environmental Sciences"]
  },
  "Computer Engineering": {
    faculty: "School of Engineering Technology",
    cutoff: 220,
    requirements: {
      utme: ["English Language", "Mathematics", "Physics", "Chemistry"],
      olevel: {
        "English Language": "C6",
        "Mathematics": "C6",
        "Physics": "C6",
        "Chemistry": "C6"
      }
    },
    capacity: 90,
    competitiveness: 0.95,
    career_prospects: ["Computer Engineer", "Hardware Engineer", "Embedded Systems Engineer"],
    interests: ["Technology & Innovation", "Engineering & Design"]
  },
  "Architecture": {
    faculty: "School of Environmental Technology",
    cutoff: 200,
    requirements: {
      utme: ["English Language", "Mathematics", "Physics", "Fine Art/Geography/Economics"],
      olevel: {
        "English Language": "C6",
        "Mathematics": "C6",
        "Physics": "C6",
        "Fine Art": "C6",
        "Technical Drawing": "C6"
      }
    },
    capacity: 80,
    competitiveness: 0.85,
    career_prospects: ["Architect", "Urban Planner", "Design Consultant"],
    interests: ["Engineering & Design", "Art & Creativity"]
  },
  "Building": {
    faculty: "School of Environmental Technology",
    cutoff: 180,
    requirements: {
      utme: ["English Language", "Mathematics", "Physics", "Chemistry/Geography/Economics"],
      olevel: {
        "English Language": "C6",
        "Mathematics": "C6",
        "Physics": "C6",
        "Technical Drawing": "C6"
      }
    },
    capacity: 100,
    competitiveness: 0.70,
    career_prospects: ["Building Engineer", "Construction Manager", "Project Manager"],
    interests: ["Engineering & Design", "Business & Management"]
  },
  "Estate Management": {
    faculty: "School of Environmental Technology",
    cutoff: 175,
    requirements: {
      utme: ["English Language", "Mathematics", "Economics", "Geography/Government"],
      olevel: {
        "English Language": "C6",
        "Mathematics": "C6",
        "Economics": "C6",
        "Geography": "C6"
      }
    },
    capacity: 90,
    competitiveness: 0.65,
    career_prospects: ["Estate Manager", "Property Valuer", "Real Estate Consultant"],
    interests: ["Business & Management", "Economics & Finance"]
  },
  "Quantity Surveying": {
    faculty: "School of Environmental Technology",
    cutoff: 185,
    requirements: {
      utme: ["English Language", "Mathematics", "Physics", "Chemistry/Economics/Geography"],
      olevel: {
        "English Language": "C6",
        "Mathematics": "C6",
        "Physics": "C6",
        "Economics": "C6"
      }
    },
    capacity: 85,
    competitiveness: 0.75,
    career_prospects: ["Quantity Surveyor", "Cost Consultant", "Project Manager"],
    interests: ["Engineering & Design", "Business & Management"]
  },
  "Urban & Regional Planning": {
    faculty: "School of Environmental Technology",
    cutoff: 170,
    requirements: {
      utme: ["English Language", "Mathematics", "Geography", "Economics/Government"],
      olevel: {
        "English Language": "C6",
        "Mathematics": "C6",
        "Geography": "C6",
        "Economics": "C6"
      }
    },
    capacity: 75,
    competitiveness: 0.60,
    career_prospects: ["Urban Planner", "Regional Planner", "Development Consultant"],
    interests: ["Environmental Sciences", "Business & Management"]
  },
  "Surveying & Geoinformatics": {
    faculty: "School of Environmental Technology",
    cutoff: 175,
    requirements: {
      utme: ["English Language", "Mathematics", "Physics", "Geography/Chemistry"],
      olevel: {
        "English Language": "C6",
        "Mathematics": "C6",
        "Physics": "C6",
        "Geography": "C6"
      }
    },
    capacity: 70,
    competitiveness: 0.65,
    career_prospects: ["Surveyor", "GIS Specialist", "Cartographer"],
    interests: ["Technology & Innovation", "Environmental Sciences"]
  },
  "Mathematics": {
    faculty: "School of Sciences",
    cutoff: 180,
    requirements: {
      utme: ["English Language", "Mathematics", "Physics", "Chemistry/Biology/Economics"],
      olevel: {
        "English Language": "C6",
        "Mathematics": "C6",
        "Physics": "C6",
        "Chemistry": "C6"
      }
    },
    capacity: 120,
    competitiveness: 0.70,
    career_prospects: ["Mathematician", "Data Analyst", "Statistician", "Actuary"],
    interests: ["Problem Solving", "Analytical Thinking"]
  },
  "Statistics": {
    faculty: "School of Sciences",
    cutoff: 175,
    requirements: {
      utme: ["English Language", "Mathematics", "Physics", "Chemistry/Biology/Economics"],
      olevel: {
        "English Language": "C6",
        "Mathematics": "C6",
        "Physics": "C6"
      }
    },
    capacity: 100,
    competitiveness: 0.65,
    career_prospects: ["Statistician", "Data Scientist", "Research Analyst"],
    interests: ["Analytical Thinking", "Problem Solving"]
  },
  "Physics": {
    faculty: "School of Sciences",
    cutoff: 185,
    requirements: {
      utme: ["English Language", "Mathematics", "Physics", "Chemistry"],
      olevel: {
        "English Language": "C6",
        "Mathematics": "C6",
        "Physics": "C6",
        "Chemistry": "C6"
      }
    },
    capacity: 110,
    competitiveness: 0.75,
    career_prospects: ["Physicist", "Research Scientist", "Engineering Physicist"],
    interests: ["Problem Solving", "Research & Development"]
  },
  "Industrial Chemistry": {
    faculty: "School of Sciences",
    cutoff: 180,
    requirements: {
      utme: ["English Language", "Mathematics", "Chemistry", "Physics"],
      olevel: {
        "English Language": "C6",
        "Mathematics": "C6",
        "Chemistry": "C6",
        "Physics": "C6"
      }
    },
    capacity: 95,
    competitiveness: 0.72,
    career_prospects: ["Industrial Chemist", "Quality Control Analyst", "Process Engineer"],
    interests: ["Problem Solving", "Research & Development"]
  },
  "Biochemistry": {
    faculty: "School of Sciences",
    cutoff: 190,
    requirements: {
      utme: ["English Language", "Biology", "Chemistry", "Physics/Mathematics"],
      olevel: {
        "English Language": "C6",
        "Biology": "C6",
        "Chemistry": "C6",
        "Physics": "C6",
        "Mathematics": "C6"
      }
    },
    capacity: 85,
    competitiveness: 0.80,
    career_prospects: ["Biochemist", "Medical Researcher", "Pharmaceutical Scientist"],
    interests: ["Health Sciences", "Research & Development"]
  },
  "Microbiology": {
    faculty: "School of Sciences",
    cutoff: 185,
    requirements: {
      utme: ["English Language", "Biology", "Chemistry", "Physics/Mathematics"],
      olevel: {
        "English Language": "C6",
        "Biology": "C6",
        "Chemistry": "C6",
        "Physics": "C6"
      }
    },
    capacity: 90,
    competitiveness: 0.78,
    career_prospects: ["Microbiologist", "Medical Laboratory Scientist", "Research Scientist"],
    interests: ["Health Sciences", "Research & Development"]
  },
  "Applied Biology": {
    faculty: "School of Sciences",
    cutoff: 175,
    requirements: {
      utme: ["English Language", "Biology", "Chemistry", "Physics/Mathematics"],
      olevel: {
        "English Language": "C6",
        "Biology": "C6",
        "Chemistry": "C6",
        "Physics": "C6"
      }
    },
    capacity: 100,
    competitiveness: 0.70,
    career_prospects: ["Biologist", "Environmental Scientist", "Research Assistant"],
    interests: ["Environmental Sciences", "Research & Development"]
  },
  "Biotechnology": {
    faculty: "School of Sciences",
    cutoff: 195,
    requirements: {
      utme: ["English Language", "Biology", "Chemistry", "Physics/Mathematics"],
      olevel: {
        "English Language": "C6",
        "Biology": "C6",
        "Chemistry": "C6",
        "Physics": "C6",
        "Mathematics": "C6"
      }
    },
    capacity: 70,
    competitiveness: 0.85,
    career_prospects: ["Biotechnologist", "Genetic Engineer", "Pharmaceutical Researcher"],
    interests: ["Health Sciences", "Technology & Innovation"]
  },
  "Food Science & Technology": {
    faculty: "School of Agriculture & Agricultural Technology",
    cutoff: 170,
    requirements: {
      utme: ["English Language", "Chemistry", "Biology/Agricultural Science", "Mathematics/Physics"],
      olevel: {
        "English Language": "C6",
        "Chemistry": "C6",
        "Biology": "C6",
        "Mathematics": "C6"
      }
    },
    capacity: 80,
    competitiveness: 0.65,
    career_prospects: ["Food Technologist", "Quality Control Manager", "Food Safety Inspector"],
    interests: ["Health Sciences", "Agriculture & Food Security"]
  },
  "Agricultural Engineering": {
    faculty: "School of Agriculture & Agricultural Technology",
    cutoff: 185,
    requirements: {
      utme: ["English Language", "Mathematics", "Physics", "Chemistry/Agricultural Science"],
      olevel: {
        "English Language": "C6",
        "Mathematics": "C6",
        "Physics": "C6",
        "Chemistry": "C6"
      }
    },
    capacity: 90,
    competitiveness: 0.75,
    career_prospects: ["Agricultural Engineer", "Farm Mechanization Specialist", "Irrigation Engineer"],
    interests: ["Engineering & Design", "Agriculture & Food Security"]
  },
  "Crop Soil & Pest Management": {
    faculty: "School of Agriculture & Agricultural Technology",
    cutoff: 160,
    requirements: {
      utme: ["English Language", "Biology/Agricultural Science", "Chemistry", "Mathematics/Physics"],
      olevel: {
        "English Language": "C6",
        "Biology": "C6",
        "Chemistry": "C6",
        "Agricultural Science": "C6"
      }
    },
    capacity: 100,
    competitiveness: 0.55,
    career_prospects: ["Agronomist", "Crop Protection Specialist", "Agricultural Consultant"],
    interests: ["Agriculture & Food Security", "Environmental Sciences"]
  },
  "Animal Production & Health Services": {
    faculty: "School of Agriculture & Agricultural Technology",
    cutoff: 165,
    requirements: {
      utme: ["English Language", "Biology/Agricultural Science", "Chemistry", "Mathematics/Physics"],
      olevel: {
        "English Language": "C6",
        "Biology": "C6",
        "Chemistry": "C6",
        "Agricultural Science": "C6"
      }
    },
    capacity: 95,
    competitiveness: 0.60,
    career_prospects: ["Animal Scientist", "Veterinary Assistant", "Livestock Manager"],
    interests: ["Agriculture & Food Security", "Health Sciences"]
  },
  "Fisheries & Aquaculture": {
    faculty: "School of Agriculture & Agricultural Technology",
    cutoff: 155,
    requirements: {
      utme: ["English Language", "Biology/Agricultural Science", "Chemistry", "Mathematics/Physics"],
      olevel: {
        "English Language": "C6",
        "Biology": "C6",
        "Chemistry": "C6"
      }
    },
    capacity: 75,
    competitiveness: 0.50,
    career_prospects: ["Fisheries Scientist", "Aquaculture Manager", "Marine Biologist"],
    interests: ["Agriculture & Food Security", "Environmental Sciences"]
  },
  "Forestry & Wood Technology": {
    faculty: "School of Agriculture & Agricultural Technology",
    cutoff: 160,
    requirements: {
      utme: ["English Language", "Biology/Agricultural Science", "Chemistry", "Mathematics/Physics"],
      olevel: {
        "English Language": "C6",
        "Biology": "C6",
        "Chemistry": "C6"
      }
    },
    capacity: 80,
    competitiveness: 0.55,
    career_prospects: ["Forester", "Wood Technologist", "Environmental Consultant"],
    interests: ["Environmental Sciences", "Agriculture & Food Security"]
  },
  "Ecotourism & Wildlife Management": {
    faculty: "School of Agriculture & Agricultural Technology",
    cutoff: 150,
    requirements: {
      utme: ["English Language", "Biology/Agricultural Science", "Geography", "Mathematics/Chemistry"],
      olevel: {
        "English Language": "C6",
        "Biology": "C6",
        "Geography": "C6"
      }
    },
    capacity: 60,
    competitiveness: 0.45,
    career_prospects: ["Wildlife Manager", "Ecotourism Specialist", "Conservation Officer"],
    interests: ["Environmental Sciences", "Tourism & Hospitality"]
  }
};

// Grade conversion utilities
export const GRADE_POINTS = {
  "A1": 9, "B2": 8, "B3": 7, "C4": 6, "C5": 5, "C6": 4, "D7": 3, "E8": 2, "F9": 1
};

export const GRADE_WEIGHTS = {
  "A1": 1.0, "B2": 0.9, "B3": 0.8, "C4": 0.7, "C5": 0.6, "C6": 0.5, "D7": 0.3, "E8": 0.1, "F9": 0.0
};

// Machine Learning Course Predictor Class
export class CoursePredictor {
  constructor() {
    this.courses = FUTA_COURSES;
    this.trainingData = this.generateTrainingData();
    this.model = null;
    this.initializeModel();
  }

  // Generate synthetic training data based on historical patterns
  generateTrainingData() {
    const data = [];
    const courseNames = Object.keys(this.courses);
    
    // Generate 500 synthetic student records (reduced for better performance)
    for (let i = 0; i < 500; i++) {
      const utmeScore = Math.floor(Math.random() * 200) + 150; // 150-350
      const olevelGPA = Math.random() * 4 + 2; // 2.0-6.0 GPA equivalent
      const interestAlignment = Math.random(); // 0-1
      const learningStyleMatch = Math.random(); // 0-1
      
      // Determine admission probability based on course requirements
      const admittedCourses = courseNames.filter(courseName => {
        const course = this.courses[courseName];
        const meetsUtme = utmeScore >= course.cutoff;
        const competitionFactor = 1 - course.competitiveness;
        const randomFactor = Math.random();
        
        return meetsUtme && (randomFactor < competitionFactor + 0.3);
      });
      
      // Only add records with valid admissions
      if (admittedCourses.length > 0) {
        data.push({
          utmeScore,
          olevelGPA,
          interestAlignment,
          learningStyleMatch,
          admittedCourses: admittedCourses[0]
        });
      }
    }
    
    return data;
  }

  // Initialize machine learning model
  initializeModel() {
    try {
      const validData = this.trainingData.filter(d => d.admittedCourses !== null);
      
      if (validData.length > 0) {
        const X = validData.map(d => [d.utmeScore, d.olevelGPA, d.interestAlignment, d.learningStyleMatch]);
        const y = validData.map(d => Object.keys(this.courses).indexOf(d.admittedCourses));
        
        // Use multivariate linear regression for prediction
        this.model = new MultivariateLinearRegression(X, y);
      }
    } catch (error) {
      console.warn('ML model initialization failed, using rule-based system:', error);
      this.model = null;
    }
  }

  // Calculate O-Level GPA
  calculateOlevelGPA(olevelSubjects) {
    const grades = Object.values(olevelSubjects).filter(grade => grade);
    if (grades.length === 0) return 0;
    
    const totalPoints = grades.reduce((sum, grade) => sum + (GRADE_POINTS[grade] || 0), 0);
    return totalPoints / grades.length;
  }

  // Calculate interest alignment score
  calculateInterestAlignment(userInterests, courseInterests) {
    if (!userInterests.length || !courseInterests.length) return 0;
    
    const matches = userInterests.filter(interest => 
      courseInterests.some(courseInterest => 
        courseInterest.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(courseInterest.toLowerCase())
      )
    );
    
    return matches.length / Math.max(userInterests.length, courseInterests.length);
  }

  // Check if student meets course requirements
  meetsRequirements(studentData, course) {
    // Check UTME score
    if (studentData.utmeScore < course.cutoff) {
      return { meets: false, reason: `UTME score ${studentData.utmeScore} below cutoff ${course.cutoff}` };
    }

    // Check UTME subjects
    const requiredUtmeSubjects = course.requirements.utme;
    const studentUtmeSubjects = studentData.utmeSubjects || [];
    
    for (const required of requiredUtmeSubjects) {
      if (required.includes('/')) {
        // Alternative subjects (OR condition)
        const alternatives = required.split('/');
        const hasAlternative = alternatives.some(alt => studentUtmeSubjects.includes(alt));
        if (!hasAlternative) {
          return { meets: false, reason: `Missing required UTME subject: ${required}` };
        }
      } else {
        // Mandatory subject
        if (!studentUtmeSubjects.includes(required)) {
          return { meets: false, reason: `Missing required UTME subject: ${required}` };
        }
      }
    }

    // Check O-Level requirements
    const requiredOlevelSubjects = course.requirements.olevel;
    const studentOlevelSubjects = studentData.olevelSubjects || {};
    
    for (const [subject, minGrade] of Object.entries(requiredOlevelSubjects)) {
      const studentGrade = studentOlevelSubjects[subject];
      if (!studentGrade) {
        return { meets: false, reason: `Missing O-Level subject: ${subject}` };
      }
      
      const studentGradePoint = GRADE_POINTS[studentGrade] || 0;
      const minGradePoint = GRADE_POINTS[minGrade] || 0;
      
      if (studentGradePoint < minGradePoint) {
        return { meets: false, reason: `${subject} grade ${studentGrade} below required ${minGrade}` };
      }
    }

    return { meets: true, reason: 'Meets all requirements' };
  }

  // Advanced prediction algorithm
  predictCourses(studentData) {
    const predictions = [];
    const courseNames = Object.keys(this.courses);
    
    for (const courseName of courseNames) {
      const course = this.courses[courseName];
      const requirementCheck = this.meetsRequirements(studentData, course);
      
      if (!requirementCheck.meets) {
        continue; // Skip courses that don't meet basic requirements
      }

      // Calculate prediction score using multiple factors
      let score = 0;
      let factors = [];

      // 1. UTME Score Factor (30%)
      const utmeScoreFactor = Math.min((studentData.utmeScore - course.cutoff + 50) / 100, 1);
      score += utmeScoreFactor * 0.3;
      factors.push(`UTME Score: ${(utmeScoreFactor * 100).toFixed(1)}%`);

      // 2. O-Level GPA Factor (25%)
      const olevelGPA = this.calculateOlevelGPA(studentData.olevelSubjects);
      const olevelFactor = Math.min(olevelGPA / 9, 1); // Normalize to 0-1
      score += olevelFactor * 0.25;
      factors.push(`O-Level GPA: ${(olevelFactor * 100).toFixed(1)}%`);

      // 3. Interest Alignment Factor (20%)
      const interestAlignment = this.calculateInterestAlignment(
        studentData.interests || [], 
        course.interests || []
      );
      score += interestAlignment * 0.2;
      factors.push(`Interest Match: ${(interestAlignment * 100).toFixed(1)}%`);

      // 4. Competition Factor (15%)
      const competitionFactor = 1 - course.competitiveness;
      score += competitionFactor * 0.15;
      factors.push(`Competition: ${(competitionFactor * 100).toFixed(1)}%`);

      // 5. Learning Style Factor (10%)
      const learningStyleFactor = this.calculateLearningStyleMatch(
        studentData.learningStyle, 
        courseName
      );
      score += learningStyleFactor * 0.1;
      factors.push(`Learning Style: ${(learningStyleFactor * 100).toFixed(1)}%`);

      // Apply ML model prediction if available
      if (this.model) {
        try {
          const mlFeatures = [
            studentData.utmeScore,
            olevelGPA,
            interestAlignment,
            learningStyleFactor
          ];
          const mlPrediction = this.model.predict([mlFeatures])[0];
          const mlScore = Math.max(0, Math.min(1, mlPrediction / courseNames.length));
          score = (score * 0.7) + (mlScore * 0.3); // Blend rule-based and ML scores
        } catch (error) {
          console.warn('ML prediction failed, using rule-based score');
        }
      }

      predictions.push({
        course: courseName,
        score: Math.max(0, Math.min(1, score)),
        probability: Math.round(score * 100),
        factors,
        details: {
          faculty: course.faculty,
          cutoff: course.cutoff,
          capacity: course.capacity,
          competitiveness: course.competitiveness,
          career_prospects: course.career_prospects
        },
        reason: requirementCheck.reason
      });
    }

    // Sort by score and return top predictions
    predictions.sort((a, b) => b.score - a.score);
    
    return {
      predictions: predictions.slice(0, 15), // Top 15 courses
      total_eligible: predictions.length,
      top_prediction: predictions.length > 0 ? predictions[0] : null,
      statistics: this.calculateStatistics(predictions, studentData)
    };
  }

  // Calculate learning style match
  calculateLearningStyleMatch(learningStyle, courseName) {
    const styleMatches = {
      "Analytical Thinker": ["Mathematics", "Statistics", "Physics", "Computer Science", "Engineering"],
      "Visual Learner": ["Architecture", "Fine Art", "Design", "Graphics"],
      "Practical Learner": ["Engineering", "Technology", "Building", "Agriculture"],
      "Conceptual Learner": ["Sciences", "Research", "Theory"],
      "Social Learner": ["Management", "Administration", "Social"]
    };

    const matches = styleMatches[learningStyle] || [];
    return matches.some(match => courseName.toLowerCase().includes(match.toLowerCase())) ? 0.8 : 0.3;
  }

  // Calculate prediction statistics
  calculateStatistics(predictions, studentData) {
    if (predictions.length === 0) {
      return {
        average_score: 0,
        score_distribution: { high: 0, medium: 0, low: 0 },
        recommended_actions: ["Improve UTME score", "Consider foundation programs"]
      };
    }

    const scores = predictions.map(p => p.score);
    const avgScore = mean(scores);
    const scoreStdDev = standardDeviation(scores);

    const distribution = {
      high: predictions.filter(p => p.score >= 0.7).length,
      medium: predictions.filter(p => p.score >= 0.4 && p.score < 0.7).length,
      low: predictions.filter(p => p.score < 0.4).length
    };

    const actions = [];
    if (avgScore < 0.5) {
      actions.push("Improve UTME score");
      actions.push("Consider foundation programs");
    }
    if (studentData.utmeScore < 200) {
      actions.push("Focus on improving UTME performance");
    }
    if (predictions.length < 5) {
      actions.push("Consider broadening subject choices");
    }

    return {
      average_score: avgScore,
      score_standard_deviation: scoreStdDev,
      score_distribution: distribution,
      recommended_actions: actions
    };
  }

  // Get course details
  getCourseDetails(courseName) {
    return this.courses[courseName] || null;
  }

  // Get all available courses
  getAllCourses() {
    return Object.keys(this.courses);
  }

  // Validate student data
  validateStudentData(studentData) {
    const errors = [];

    if (!studentData.name || studentData.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters long");
    }

    if (!studentData.utmeScore || studentData.utmeScore < 0 || studentData.utmeScore > 400) {
      errors.push("UTME score must be between 0 and 400");
    }

    if (!studentData.utmeSubjects || studentData.utmeSubjects.length !== 4) {
      errors.push("Exactly 4 UTME subjects must be selected");
    }

    if (!studentData.utmeSubjects || !studentData.utmeSubjects.includes("English Language")) {
      errors.push("English Language is mandatory for UTME");
    }

    if (!studentData.olevelSubjects || Object.keys(studentData.olevelSubjects).length < 5) {
      errors.push("At least 5 O-Level subjects with grades must be provided");
    }

    const requiredOlevelSubjects = ["English Language", "Mathematics"];
    for (const subject of requiredOlevelSubjects) {
      if (!studentData.olevelSubjects || !studentData.olevelSubjects[subject]) {
        errors.push(`${subject} is required at O-Level`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const coursePredictor = new CoursePredictor();