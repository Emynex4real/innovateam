import { coursePredictor, FUTA_COURSES, GRADE_POINTS } from '../coursePredictor';

describe('CoursePredictor', () => {
  const sampleStudentData = {
    name: 'John Doe',
    utmeScore: 280,
    utmeSubjects: ['English Language', 'Mathematics', 'Physics', 'Chemistry'],
    olevelSubjects: {
      'English Language': 'B3',
      'Mathematics': 'A1',
      'Physics': 'B2',
      'Chemistry': 'B3',
      'Biology': 'C4',
      'Economics': 'C5'
    },
    interests: ['Technology & Innovation', 'Engineering & Design'],
    learningStyle: 'Analytical Thinker',
    stateOfOrigin: 'Lagos',
    gender: 'Male'
  };

  describe('Data Validation', () => {
    test('should validate correct student data', () => {
      const validation = coursePredictor.validateStudentData(sampleStudentData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should reject invalid UTME score', () => {
      const invalidData = { ...sampleStudentData, utmeScore: 450 };
      const validation = coursePredictor.validateStudentData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('UTME score must be between 0 and 400');
    });

    test('should reject missing English Language in UTME', () => {
      const invalidData = { 
        ...sampleStudentData, 
        utmeSubjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology'] 
      };
      const validation = coursePredictor.validateStudentData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('English Language is mandatory for UTME');
    });

    test('should reject insufficient O-Level subjects', () => {
      const invalidData = { 
        ...sampleStudentData, 
        olevelSubjects: { 'English Language': 'B3', 'Mathematics': 'A1' } 
      };
      const validation = coursePredictor.validateStudentData(invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('At least 5 O-Level subjects with grades must be provided');
    });
  });

  describe('Course Prediction', () => {
    test('should predict courses for qualified student', () => {
      const prediction = coursePredictor.predictCourses(sampleStudentData);
      
      expect(prediction).toHaveProperty('predictions');
      expect(prediction).toHaveProperty('total_eligible');
      expect(prediction).toHaveProperty('top_prediction');
      expect(prediction).toHaveProperty('statistics');
      
      expect(Array.isArray(prediction.predictions)).toBe(true);
      expect(prediction.total_eligible).toBeGreaterThan(0);
      expect(prediction.top_prediction).toBeTruthy();
    });

    test('should return top prediction with high score for qualified student', () => {
      const prediction = coursePredictor.predictCourses(sampleStudentData);
      
      expect(prediction.top_prediction.score).toBeGreaterThan(0.5);
      expect(prediction.top_prediction.probability).toBeGreaterThan(50);
      expect(prediction.top_prediction.course).toBeTruthy();
    });

    test('should prioritize courses matching interests', () => {
      const techStudent = {
        ...sampleStudentData,
        interests: ['Technology & Innovation'],
        utmeScore: 300
      };
      
      const prediction = coursePredictor.predictCourses(techStudent);
      const topCourse = prediction.top_prediction.course;
      
      // Should recommend tech-related courses
      const techCourses = ['Computer Science', 'Software Engineering', 'Information Technology', 'Computer Engineering'];
      expect(techCourses.some(course => topCourse.includes(course.split(' ')[0]))).toBe(true);
    });

    test('should handle low UTME scores appropriately', () => {
      const lowScoreStudent = {
        ...sampleStudentData,
        utmeScore: 150
      };
      
      const prediction = coursePredictor.predictCourses(lowScoreStudent);
      
      // Should have fewer eligible courses
      expect(prediction.total_eligible).toBeLessThan(10);
      
      // Should have recommended actions
      expect(prediction.statistics.recommended_actions).toContain('Improve UTME score');
    });
  });

  describe('O-Level GPA Calculation', () => {
    test('should calculate correct GPA', () => {
      const olevelSubjects = {
        'English Language': 'A1', // 9 points
        'Mathematics': 'B2',      // 8 points
        'Physics': 'B3',          // 7 points
        'Chemistry': 'C4',        // 6 points
        'Biology': 'C5'           // 5 points
      };
      
      const expectedGPA = (9 + 8 + 7 + 6 + 5) / 5; // 7.0
      const calculatedGPA = coursePredictor.calculateOlevelGPA(olevelSubjects);
      
      expect(calculatedGPA).toBe(expectedGPA);
    });

    test('should handle empty subjects', () => {
      const gpa = coursePredictor.calculateOlevelGPA({});
      expect(gpa).toBe(0);
    });
  });

  describe('Course Requirements', () => {
    test('should check requirements correctly for Computer Science', () => {
      const csStudent = {
        ...sampleStudentData,
        utmeScore: 250,
        utmeSubjects: ['English Language', 'Mathematics', 'Physics', 'Chemistry']
      };
      
      const course = FUTA_COURSES['Computer Science'];
      const requirementCheck = coursePredictor.meetsRequirements(csStudent, course);
      
      expect(requirementCheck.meets).toBe(true);
    });

    test('should reject student not meeting UTME cutoff', () => {
      const lowScoreStudent = {
        ...sampleStudentData,
        utmeScore: 150
      };
      
      const course = FUTA_COURSES['Computer Science'];
      const requirementCheck = coursePredictor.meetsRequirements(lowScoreStudent, course);
      
      expect(requirementCheck.meets).toBe(false);
      expect(requirementCheck.reason).toContain('UTME score');
    });

    test('should reject student missing required subjects', () => {
      const missingSubjectStudent = {
        ...sampleStudentData,
        utmeSubjects: ['English Language', 'Biology', 'Geography', 'Economics']
      };
      
      const course = FUTA_COURSES['Computer Science'];
      const requirementCheck = coursePredictor.meetsRequirements(missingSubjectStudent, course);
      
      expect(requirementCheck.meets).toBe(false);
      expect(requirementCheck.reason).toContain('Missing required UTME subject');
    });
  });

  describe('Interest Alignment', () => {
    test('should calculate interest alignment correctly', () => {
      const userInterests = ['Technology & Innovation', 'Engineering & Design'];
      const courseInterests = ['Technology & Innovation', 'Problem Solving'];
      
      const alignment = coursePredictor.calculateInterestAlignment(userInterests, courseInterests);
      
      expect(alignment).toBeGreaterThan(0);
      expect(alignment).toBeLessThanOrEqual(1);
    });

    test('should return 0 for no matching interests', () => {
      const userInterests = ['Art & Creativity'];
      const courseInterests = ['Technology & Innovation'];
      
      const alignment = coursePredictor.calculateInterestAlignment(userInterests, courseInterests);
      
      expect(alignment).toBe(0);
    });
  });

  describe('Learning Style Matching', () => {
    test('should match analytical thinker with math courses', () => {
      const match = coursePredictor.calculateLearningStyleMatch('Analytical Thinker', 'Mathematics');
      expect(match).toBe(0.8);
    });

    test('should match practical learner with engineering courses', () => {
      const match = coursePredictor.calculateLearningStyleMatch('Practical Learner', 'Mechanical Engineering');
      expect(match).toBe(0.8);
    });

    test('should give lower score for non-matching styles', () => {
      const match = coursePredictor.calculateLearningStyleMatch('Visual Learner', 'Mathematics');
      expect(match).toBe(0.3);
    });
  });

  describe('Statistics Calculation', () => {
    test('should calculate prediction statistics', () => {
      const predictions = [
        { score: 0.8 }, { score: 0.6 }, { score: 0.4 }, { score: 0.2 }
      ];
      
      const stats = coursePredictor.calculateStatistics(predictions, sampleStudentData);
      
      expect(stats).toHaveProperty('average_score');
      expect(stats).toHaveProperty('score_distribution');
      expect(stats).toHaveProperty('recommended_actions');
      
      expect(stats.score_distribution.high).toBe(1); // score >= 0.7
      expect(stats.score_distribution.medium).toBe(2); // 0.4 <= score < 0.7
      expect(stats.score_distribution.low).toBe(1); // score < 0.4
    });
  });

  describe('Course Database', () => {
    test('should have valid course data structure', () => {
      Object.entries(FUTA_COURSES).forEach(([courseName, courseData]) => {
        expect(courseData).toHaveProperty('faculty');
        expect(courseData).toHaveProperty('cutoff');
        expect(courseData).toHaveProperty('requirements');
        expect(courseData).toHaveProperty('capacity');
        expect(courseData).toHaveProperty('competitiveness');
        
        expect(typeof courseData.cutoff).toBe('number');
        expect(courseData.cutoff).toBeGreaterThan(0);
        expect(courseData.cutoff).toBeLessThanOrEqual(400);
        
        expect(typeof courseData.competitiveness).toBe('number');
        expect(courseData.competitiveness).toBeGreaterThan(0);
        expect(courseData.competitiveness).toBeLessThanOrEqual(1);
      });
    });

    test('should have all required grade points defined', () => {
      const requiredGrades = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'];
      requiredGrades.forEach(grade => {
        expect(GRADE_POINTS).toHaveProperty(grade);
        expect(typeof GRADE_POINTS[grade]).toBe('number');
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle student with no interests', () => {
      const noInterestStudent = {
        ...sampleStudentData,
        interests: []
      };
      
      const prediction = coursePredictor.predictCourses(noInterestStudent);
      expect(prediction.predictions).toBeDefined();
      expect(Array.isArray(prediction.predictions)).toBe(true);
    });

    test('should handle student with no learning style', () => {
      const noStyleStudent = {
        ...sampleStudentData,
        learningStyle: ''
      };
      
      const prediction = coursePredictor.predictCourses(noStyleStudent);
      expect(prediction.predictions).toBeDefined();
    });

    test('should handle maximum UTME score', () => {
      const maxScoreStudent = {
        ...sampleStudentData,
        utmeScore: 400
      };
      
      const prediction = coursePredictor.predictCourses(maxScoreStudent);
      expect(prediction.total_eligible).toBeGreaterThan(10);
      expect(prediction.top_prediction.score).toBeGreaterThan(0.7);
    });
  });
});

// Integration tests
describe('CoursePredictor Integration', () => {
  const sampleStudentData = {
    name: 'John Doe',
    utmeScore: 280,
    utmeSubjects: ['English Language', 'Mathematics', 'Physics', 'Chemistry'],
    olevelSubjects: {
      'English Language': 'B3',
      'Mathematics': 'A1',
      'Physics': 'B2',
      'Chemistry': 'B3',
      'Biology': 'C4',
      'Economics': 'C5'
    },
    interests: ['Technology & Innovation', 'Engineering & Design'],
    learningStyle: 'Analytical Thinker',
    stateOfOrigin: 'Lagos',
    gender: 'Male'
  };

  test('should provide consistent predictions for same input', () => {
    const prediction1 = coursePredictor.predictCourses(sampleStudentData);
    const prediction2 = coursePredictor.predictCourses(sampleStudentData);
    
    expect(prediction1.top_prediction.course).toBe(prediction2.top_prediction.course);
    expect(prediction1.total_eligible).toBe(prediction2.total_eligible);
  });

  test('should handle real-world student scenarios', () => {
    const scenarios = [
      {
        name: 'High achiever',
        data: { ...sampleStudentData, utmeScore: 350 }
      },
      {
        name: 'Average student',
        data: { ...sampleStudentData, utmeScore: 220 }
      },
      {
        name: 'Struggling student',
        data: { ...sampleStudentData, utmeScore: 160 }
      }
    ];

    scenarios.forEach(scenario => {
      const prediction = coursePredictor.predictCourses(scenario.data);
      
      expect(prediction).toBeDefined();
      expect(prediction.predictions).toBeDefined();
      expect(prediction.statistics).toBeDefined();
      
      // Higher scores should get more eligible courses
      if (scenario.data.utmeScore > 300) {
        expect(prediction.total_eligible).toBeGreaterThan(8);
      }
    });
  });
});