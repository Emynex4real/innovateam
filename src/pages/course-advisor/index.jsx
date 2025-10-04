import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import debounce from 'lodash/debounce';
import deepseekService from '../../services/deepseek.service';
import { FaGraduationCap, FaCheckCircle, FaExclamationCircle, FaStar, FaTrophy } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create debounced API call function
const debouncedApiCall = debounce((request) => request(), 1000);

const GRADES = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'];
const OLEVEL_SUBJECTS = [
  "English Language", "Mathematics", "Physics", "Chemistry", "Biology", "Economics", "Geography",
  "Agricultural Science", "Further Mathematics", "Government", "Literature in English", "Fine Art",
  "Technical Drawing", "Commerce", "Accounting", "Computer Studies", "Civic Education", "CRS", "IRS"
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const SIDEBAR_BRAND = (
  <div className="flex flex-col items-center py-8 bg-green-900 text-white min-h-screen">
    <FaGraduationCap size={48} className="mb-2" />
    <h2 className="text-2xl font-bold mb-2">FUTA Advisor</h2>
    <p className="text-sm mb-4">Your smart guide to university admission success.</p>
    <hr className="border-green-700 w-3/4 mb-4" />
    <span className="text-xs">Powered by AI & Real Data</span>
  </div>
);

const Card = ({ children, className }) => (
  <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 mb-8 ${className || ''}`}>{children}</div>
);

const ProgressBar = ({ loading }) => (
  loading ? (
    <div className="w-full bg-green-100 rounded-full h-2.5 mb-4">
      <div className="bg-green-600 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
    </div>
  ) : null
);

const CourseAdvisor = () => {
    const FUTA_COURSES = {
    "Agric Extension & Communication Technology": {
      faculty: "Agriculture",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Chemistry", "Mathematics", "Biology/Agricultural Science"],
        utme: ["English Language", "Chemistry", "Biology/Agricultural Science", "Physics/Mathematics"]
      },
      interests: ["agriculture", "communication", "extension", "technology"],
      capacity: 100,
      careerProspects: ["Agricultural Extension Officer", "Communication Specialist", "Technology Consultant"]
    },
    "Agricultural Engineering": {
      faculty: "Engineering",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics", "Chemistry"],
        utme: ["English Language", "Mathematics", "Chemistry", "Physics"]
      },
      interests: ["agriculture", "engineering", "technology"],
      capacity: 100,
      careerProspects: ["Agricultural Engineer", "Irrigation Specialist", "Farm Machinery Designer"]
    },
    "Agriculture Resources Economics": {
      faculty: "Agriculture",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Chemistry", "Mathematics", "Biology"],
        utme: ["English Language", "Chemistry", "Biology/Agricultural Science", "Physics/Mathematics"]
      },
      interests: ["agriculture", "economics", "resources"],
      capacity: 100,
      careerProspects: ["Agricultural Economist", "Resource Manager", "Policy Analyst"]
    },
    "Animal Production & Health Services": {
      faculty: "Agriculture",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Chemistry", "Mathematics", "Biology/Agricultural Science"],
        utme: ["English Language", "Chemistry", "Biology/Agricultural Science", "Physics/Mathematics"]
      },
      interests: ["animal", "production", "health", "agriculture"],
      capacity: 100,
      careerProspects: ["Animal Production Manager", "Veterinary Assistant", "Livestock Consultant"]
    },
    "Applied Biology": {
      faculty: "Science",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Biology", "Chemistry", "Mathematics"],
        utme: ["English Language", "Chemistry/Physics/Mathematics/Biology/Geography"]
      },
      interests: ["biology", "applied", "science"],
      capacity: 100,
      careerProspects: ["Biologist", "Environmental Scientist", "Research Assistant"]
    },
    "Applied Geophysics": {
      faculty: "Science",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics"],
        utme: ["English Language", "Physics/Chemistry/Biology/Mathematics"]
      },
      interests: ["geophysics", "applied", "science"],
      capacity: 100,
      careerProspects: ["Geophysicist", "Exploration Scientist", "Seismologist"]
    },
    "Architecture": {
      faculty: "Environmental Sciences",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics", "Chemistry"],
        utme: ["English Language", "Physics", "Mathematics", "Chemistry/Geography/Art/Biology/Economics"]
      },
      interests: ["architecture", "design", "building", "art", "construction"],
      capacity: 100,
      careerProspects: ["Architect", "Urban Designer", "Interior Designer"]
    },
    "Biochemistry": {
      faculty: "Science",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Chemistry", "Mathematics", "Physics", "Biology"],
        utme: ["English Language", "Biology", "Chemistry", "Physics/Mathematics"]
      },
      interests: ["biochemistry", "medicine", "health", "research", "laboratory"],
      capacity: 100,
      careerProspects: ["Biochemist", "Pharmaceutical Researcher", "Clinical Laboratory Technologist"]
    },
    "Biology": {
      faculty: "Science",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Biology", "Chemistry", "Mathematics/Physics"],
        utme: ["English Language", "Biology", "Chemistry", "Physics/Mathematics"]
      },
      interests: ["biology", "life", "medicine", "health", "research"],
      capacity: 100,
      careerProspects: ["Biologist", "Teacher", "Ecologist"]
    },
    "Biomedical Technology": {
      faculty: "Science",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics", "Chemistry", "Biology"],
        utme: ["English Language", "Physics", "Chemistry", "Biology"]
      },
      interests: ["biomedical", "technology", "medicine"],
      capacity: 100,
      careerProspects: ["Biomedical Technician", "Medical Equipment Specialist", "Health Technology Consultant"]
    },
    "Biotechnology": {
      faculty: "Science",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics"],
        utme: ["English Language", "Biology", "Chemistry", "Any Science"]
      },
      interests: ["biotechnology", "science", "research"],
      capacity: 100,
      careerProspects: ["Biotechnologist", "Genetic Engineer", "Research Scientist"]
    },
    "Building": {
      faculty: "Environmental Sciences",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics", "Chemistry"],
        utme: ["English Language", "Mathematics", "Physics", "Chemistry"]
      },
      interests: ["building", "construction", "engineering", "design"],
      capacity: 100,
      careerProspects: ["Builder", "Construction Manager", "Project Coordinator"]
    },
    "Civil Engineering": {
      faculty: "Engineering",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics", "Chemistry"],
        utme: ["English Language", "Physics", "Chemistry", "Mathematics"]
      },
      interests: ["civil", "engineering", "construction"],
      capacity: 100,
      careerProspects: ["Civil Engineer", "Structural Engineer", "Transportation Engineer"]
    },
    "Computer Engineering": {
      faculty: "Engineering",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Further Mathematics", "Chemistry", "Physics"],
        utme: ["English Language", "Mathematics", "Physics", "Chemistry"]
      },
      interests: ["computer", "engineering", "technology"],
      capacity: 100,
      careerProspects: ["Computer Engineer", "Hardware Developer", "Embedded Systems Specialist"]
    },
    "Computer Science": {
      faculty: "Engineering",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics"],
        utme: ["English Language", "Mathematics", "Physics", "Biology/Chemistry/Agric Science/Economics/Geography"]
      },
      interests: ["computer", "science", "technology"],
      capacity: 100,
      careerProspects: ["Software Developer", "Data Scientist", "IT Consultant"]
    },
    "Crop Soil & Pest Management": {
      faculty: "Agriculture",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Chemistry", "Biology/Agricultural Science", "Mathematics"],
        utme: ["English Language", "Chemistry", "Biology/Agricultural Science", "Mathematics/Physics"]
      },
      interests: ["crop", "soil", "pest", "management", "agriculture"],
      capacity: 100,
      careerProspects: ["Agronomist", "Soil Scientist", "Pest Control Specialist"]
    },
    "Cyber Security": {
      faculty: "Technology",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics"],
        utme: ["English Language", "Mathematics", "Physics", "Biology/Chemistry/Agric Science/Economics/Geography"]
      },
      interests: ["cyber", "security", "technology"],
      capacity: 100,
      careerProspects: ["Cyber Security Analyst", "Ethical Hacker", "Security Consultant"]
    },
    "Ecotourism & Wildlife Management": {
      faculty: "Agriculture",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Mathematics", "Biology/Agricultural Science"],
        utme: ["English Language", "Biology/Agricultural Science", "Chemistry/Geography/Economics/Mathematics/Physics"]
      },
      interests: ["ecotourism", "wildlife", "management"],
      capacity: 100,
      careerProspects: ["Ecotourism Guide", "Wildlife Manager", "Conservation Specialist"]
    },
    "Electrical/Electronics Engineering": {
      faculty: "Engineering",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics", "Chemistry"],
        utme: ["English Language", "Mathematics", "Physics", "Chemistry"]
      },
      interests: ["electrical", "electronics", "engineering"],
      capacity: 100,
      careerProspects: ["Electrical Engineer", "Electronics Designer", "Power Systems Specialist"]
    },
    "Estate Management": {
      faculty: "Environmental Sciences",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Chemistry"],
        utme: ["English Language", "Mathematics", "Economics", "Any Subject"]
      },
      interests: ["estate", "management", "real estate"],
      capacity: 100,
      careerProspects: ["Estate Manager", "Real Estate Agent", "Property Valuer"]
    },
    "Fisheries & Aquaculture": {
      faculty: "Agriculture",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Chemistry", "Biology/Agricultural Science", "Mathematics"],
        utme: ["English Language", "Chemistry", "Biology/Agricultural Science", "Mathematics/Physics"]
      },
      interests: ["fisheries", "aquaculture", "agriculture"],
      capacity: 100,
      careerProspects: ["Fisheries Manager", "Aquaculture Specialist", "Marine Biologist"]
    },
    "Food Science & Technology": {
      faculty: "Agriculture",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Mathematics", "Chemistry", "Biology/Agricultural Science"],
        utme: ["English Language", "Chemistry", "Mathematics/Physics", "Biology/Agricultural Science"]
      },
      interests: ["food", "science", "technology"],
      capacity: 100,
      careerProspects: ["Food Scientist", "Quality Control Analyst", "Nutritionist"]
    },
    "Forestry & Wood Technology": {
      faculty: "Agriculture",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Chemistry", "Biology/Agricultural Science", "Mathematics"],
        utme: ["English Language", "Chemistry", "Biology/Agricultural Science", "Mathematics/Physics"]
      },
      interests: ["forestry", "wood", "technology", "agriculture"],
      capacity: 100,
      careerProspects: ["Forester", "Wood Technologist", "Environmental Manager"]
    },
    "Human Anatomy": {
      faculty: "Science",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics"],
        utme: ["English Language", "Biology", "Chemistry", "Physics"]
      },
      interests: ["human", "anatomy", "science"],
      capacity: 100,
      careerProspects: ["Anatomist", "Medical Educator", "Research Scientist"]
    },
    "Industrial & Production Engineering": {
      faculty: "Engineering",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics", "Chemistry"],
        utme: ["English Language", "Mathematics", "Physics", "Chemistry"]
      },
      interests: ["industrial", "production", "engineering"],
      capacity: 100,
      careerProspects: ["Industrial Engineer", "Production Manager", "Operations Analyst"]
    },
    "Industrial Chemistry": {
      faculty: "Science",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Mathematics", "Chemistry", "Physics", "Biology/Agricultural Science"],
        utme: ["English Language", "Chemistry", "Mathematics", "Physics/Biology/Agricultural Science"]
      },
      interests: ["industrial", "chemistry", "science"],
      capacity: 100,
      careerProspects: ["Industrial Chemist", "Quality Control Analyst", "Research Chemist"]
    },
    "Industrial Design": {
      faculty: "Technology",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Chemistry", "Fine Art"],
        utme: ["English Language", "Chemistry", "Mathematics", "Fine Arts/Physics"]
      },
      interests: ["industrial", "design", "technology"],
      capacity: 100,
      careerProspects: ["Industrial Designer", "Product Designer", "UX Designer"]
    },
    "Industrial Mathematics": {
      faculty: "Science",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics"],
        utme: ["English Language", "Mathematics", "Physics/Chemistry/Economics/Biology/Agricultural Science"]
      },
      interests: ["industrial", "mathematics", "science"],
      capacity: 100,
      careerProspects: ["Mathematical Modeler", "Data Analyst", "Operations Researcher"]
    },
    "Information & Communication Technology": {
      faculty: "Technology",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Economics", "Mathematics"],
        utme: ["English Language", "Mathematics", "Economics", "Account/Commerce/Government"]
      },
      interests: ["information", "communication", "technology"],
      capacity: 100,
      careerProspects: ["ICT Specialist", "Network Administrator", "Communication Analyst"]
    },
    "Information Systems": {
      faculty: "Technology",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics"],
        utme: ["English Language", "Mathematics", "Physics", "Biology/Chemistry/Agric Science/Economics/Geography"]
      },
      interests: ["information", "systems", "technology"],
      capacity: 100,
      careerProspects: ["Information Systems Manager", "Database Administrator", "Systems Analyst"]
    },
    "Information Technology": {
      faculty: "Technology",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics"],
        utme: ["English Language", "Mathematics", "Physics", "Biology/Chemistry/Agric Science/Economics/Geography"]
      },
      interests: ["information", "technology"],
      capacity: 100,
      careerProspects: ["IT Consultant", "Software Engineer", "Network Specialist"]
    },
    "Marine Science & Technology": {
      faculty: "Science",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Mathematics", "Biology"],
        utme: ["English Language", "Biology", "Physics/Chemistry/Mathematics"]
      },
      interests: ["marine", "science", "technology"],
      capacity: 100,
      careerProspects: ["Marine Scientist", "Oceanographer", "Technology Specialist"]
    },
    "Mathematics": {
      faculty: "Science",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics/Chemistry"],
        utme: ["English Language", "Mathematics", "Physics/Chemistry/Economics/Geography"]
      },
      interests: ["mathematics", "science"],
      capacity: 100,
      careerProspects: ["Mathematician", "Statistician", "Teacher"]
    },
    "Mechanical Engineering": {
      faculty: "Engineering",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics", "Chemistry"],
        utme: ["English Language", "Mathematics", "Physics", "Chemistry"]
      },
      interests: ["mechanical", "engineering"],
      capacity: 100,
      careerProspects: ["Mechanical Engineer", "Design Engineer", "Manufacturing Specialist"]
    },
    "Medical Laboratory Science": {
      faculty: "Science",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Mathematics", "Chemistry", "Biology", "Physics"],
        utme: ["English Language", "Biology", "Chemistry", "Physics"]
      },
      interests: ["medical", "laboratory", "science"],
      capacity: 100,
      careerProspects: ["Medical Laboratory Scientist", "Lab Technician", "Diagnostic Specialist"]
    },
    "Metallurgical & Materials Engineering": {
      faculty: "Engineering",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics", "Chemistry"],
        utme: ["English Language", "Physics", "Chemistry", "Mathematics"]
      },
      interests: ["metallurgical", "materials", "engineering"],
      capacity: 100,
      careerProspects: ["Metallurgist", "Materials Engineer", "Quality Control Engineer"]
    },
    "Meteorology": {
      faculty: "Science",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics"],
        utme: ["English Language", "Mathematics", "Physics", "Chemistry/Geography"]
      },
      interests: ["meteorology", "science"],
      capacity: 100,
      careerProspects: ["Meteorologist", "Weather Forecaster", "Climate Scientist"]
    },
    "Microbiology": {
      faculty: "Science",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Mathematics", "Chemistry", "Biology", "Physics"],
        utme: ["English Language", "Biology", "Chemistry", "Physics/Mathematics"]
      },
      interests: ["microbiology", "science", "research"],
      capacity: 100,
      careerProspects: ["Microbiologist", "Lab Researcher", "Infection Control Specialist"]
    },
    "Mining Engineering": {
      faculty: "Engineering",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics", "Chemistry"],
        utme: ["English Language", "Chemistry", "Mathematics", "Physics"]
      },
      interests: ["mining", "engineering"],
      capacity: 100,
      careerProspects: ["Mining Engineer", "Mine Manager", "Resource Extraction Specialist"]
    },
    "Physics": {
      faculty: "Science",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Physics", "Chemistry", "Mathematics"],
        utme: ["English Language", "Physics", "Mathematics", "Chemistry/Biology"]
      },
      interests: ["physics", "science"],
      capacity: 100,
      careerProspects: ["Physicist", "Research Scientist", "Teacher"]
    },
    "Physiology": {
      faculty: "Science",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics", "Chemistry", "Biology"],
        utme: ["English Language", "Physics", "Chemistry", "Biology"]
      },
      interests: ["physiology", "science"],
      capacity: 100,
      careerProspects: ["Physiologist", "Medical Researcher", "Health Specialist"]
    },
    "Quantity Surveying": {
      faculty: "Environmental Sciences",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics", "Chemistry"],
        utme: ["English Language", "Physics", "Mathematics", "Chemistry/Geography/Art/Biology/Economics"]
      },
      interests: ["quantity", "surveying", "construction"],
      capacity: 100,
      careerProspects: ["Quantity Surveyor", "Cost Estimator", "Construction Consultant"]
    },
    "Remote Sensing & Geoscience Information System": {
      faculty: "Environmental Sciences",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics", "Chemistry"],
        utme: ["English Language", "Physics", "Mathematics", "Chemistry/Geography/Art/Biology/Economics"]
      },
      interests: ["remote sensing", "geoscience", "information system"],
      capacity: 100,
      careerProspects: ["GIS Specialist", "Remote Sensing Analyst", "Geospatial Engineer"]
    },
    "Software Engineering": {
      faculty: "Technology",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics"],
        utme: ["English Language", "Mathematics", "Physics", "Biology/Chemistry/Agric Science/Economics/Geography"]
      },
      interests: ["software", "engineering", "technology"],
      capacity: 100,
      careerProspects: ["Software Engineer", "Developer", "Systems Architect"]
    },
    "Statistics": {
      faculty: "Science",
      cutoff: 180,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics"],
        utme: ["English Language", "Mathematics", "Physics/Chemistry/Economics"]
      },
      interests: ["statistics", "science"],
      capacity: 100,
      careerProspects: ["Statistician", "Data Analyst", "Research Analyst"]
    },
    "Surveying & Geoinformatics": {
      faculty: "Environmental Sciences",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Physics", "Chemistry"],
        utme: ["English Language", "Physics", "Mathematics", "Chemistry/Geography/Art/Biology/Economics"]
      },
      interests: ["surveying", "geoinformatics"],
      capacity: 100,
      careerProspects: ["Surveyor", "Geoinformatics Specialist", "Mapping Expert"]
    },
    "Urban & Regional Planning": {
      faculty: "Environmental Sciences",
      cutoff: 200,
      requirements: {
        waec: ["English Language", "Mathematics", "Geography"],
        utme: ["English Language", "Mathematics", "Geography", "Economics/Physics/Chemistry"]
      },
      interests: ["urban", "regional", "planning"],
      capacity: 100,
      careerProspects: ["Urban Planner", "Regional Developer", "Policy Advisor"]
    }
  };
  const COURSE_LIST = Object.keys(FUTA_COURSES);
  const STATE_LIST = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
    "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
    "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
    "Yobe", "Zamfara"
  ];
  const GENDER_LIST = ["Male", "Female", "Other"];
  const [preferredCourse, setPreferredCourse] = useState("");
  const [stateOfOrigin, setStateOfOrigin] = useState("");
  const [gender, setGender] = useState("");
  const { isDarkMode } = useDarkMode();
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Course Recommendation State
  const [olevelGrades, setOlevelGrades] = useState({});
  const [jambScore, setJambScore] = useState('');
  const [interests, setInterests] = useState('');
  const [utmeSubjects, setUtmeSubjects] = useState(["English Language"]);
  const [eligibleCourses, setEligibleCourses] = useState([]);
  const [preferredEligibility, setPreferredEligibility] = useState(null);
  const [recommendLoading, setRecommendLoading] = useState(false);

  // Question Generator State
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState('');
  const [questionLoading, setQuestionLoading] = useState(false);
  const fileInputRef = React.useRef(null);

  // Expanded FUTA Course Database with accurate requirements and UTME subject combinations


  const GRADE_POINTS = {
    "A1": 9, "B2": 8, "B3": 7, "C4": 6, "C5": 5, "C6": 4
  };

  const calculateGPA = (grades) => {
    const validGrades = Object.values(grades).filter(grade => grade && GRADE_POINTS[grade]);
    if (validGrades.length === 0) return 0;
    const totalPoints = validGrades.reduce((sum, grade) => sum + GRADE_POINTS[grade], 0);
    return totalPoints / validGrades.length;
  };

  const checkCourseEligibility = (course, jambScore, olevelGrades, interests, utmeSubjects) => {
    const courseData = FUTA_COURSES[course];
    if (!courseData) return { eligible: false, score: 0, reasons: [] };

    let score = 0;
    const reasons = [];

    // Check JAMB score (40% weight)
    if (jambScore >= courseData.cutoff) {
      const jambScore_normalized = Math.min((jambScore - courseData.cutoff + 50) / 100, 1);
      score += jambScore_normalized * 0.4;
      reasons.push(`JAMB Score: ${jambScore} (Cutoff: ${courseData.cutoff}) ✓`);
    } else {
      reasons.push(`JAMB Score: ${jambScore} (Below cutoff: ${courseData.cutoff}) ✗`);
      return { eligible: false, score: 0, reasons };
    }

    // Check O-Level requirements (30% weight)
    const hasRequiredSubjects = courseData.requirements.waec.every(req => {
      const alternatives = req.split('/');
      return alternatives.some(sub => {
        const grade = olevelGrades[sub];
        return grade && GRADE_POINTS[grade] >= 4; // At least C6
      });
    });

    if (hasRequiredSubjects) {
      const gpa = calculateGPA(olevelGrades);
      const olevelScore = Math.min(gpa / 9, 1);
      score += olevelScore * 0.3;
      reasons.push(`O-Level Requirements: Met (GPA: ${gpa.toFixed(1)}) ✓`);
    } else {
      reasons.push(`O-Level Requirements: Missing required subjects ✗`);
      return { eligible: false, score: 0, reasons };
    }

    // Check UTME subjects (required, no weight)
    const hasRequiredUtme = courseData.requirements.utme.every(req => {
      const alternatives = req.split('/');
      return alternatives.some(sub => utmeSubjects.includes(sub));
    });

    if (!hasRequiredUtme) {
      reasons.push(`UTME Subjects: Missing required subjects ✗`);
      return { eligible: false, score: 0, reasons };
    } else {
      reasons.push(`UTME Subjects: Met ✓`);
    }

    // Check interest alignment (30% weight)
    const interestWords = interests.toLowerCase().split(/\s+/);
    const matchingInterests = courseData.interests.filter(interest => 
      interestWords.some(word => word.includes(interest) || interest.includes(word))
    );
    const interestScore = matchingInterests.length / courseData.interests.length;
    score += interestScore * 0.3;
    reasons.push(`Interest Match: ${(interestScore * 100).toFixed(0)}% (${matchingInterests.join(', ')})`);

    return {
      eligible: true,
      score: Math.min(score, 1),
      reasons,
      faculty: courseData.faculty,
      cutoff: courseData.cutoff,
      capacity: courseData.capacity,
      careerProspects: courseData.careerProspects
    };
  };

  const handleRecommendationSubmit = async (e) => {
    e.preventDefault();
    setEligibleCourses([]);
    setPreferredEligibility(null);

    // Validate inputs
    const selectedOlevelSubjects = Object.keys(olevelGrades).filter(subj => olevelGrades[subj]);
    if (selectedOlevelSubjects.length < 5) {
      toast.error('Please select grades for at least 5 O-Level subjects');
      return;
    }

    const score = parseInt(jambScore);
    if (isNaN(score) || score < 0 || score > 400) {
      toast.error('JAMB score must be between 0 and 400');
      return;
    }

    if (utmeSubjects.length !== 4) {
      toast.error('Please select exactly 4 UTME subjects including English Language');
      return;
    }

    if (!interests.trim()) {
      toast.error('Please enter your interests');
      return;
    }

    setRecommendLoading(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let eligibleCourses = [];
      
      // Check eligibility for all courses
      Object.keys(FUTA_COURSES).forEach(courseName => {
        const eligibility = checkCourseEligibility(courseName, score, olevelGrades, interests, utmeSubjects);
        if (eligibility.eligible) {
          eligibleCourses.push({
            course: courseName,
            ...eligibility
          });
        }
      });

      // Sort by score (highest first)
      eligibleCourses.sort((a, b) => b.score - a.score);

      let preferredEligibilityLocal = null;
      if (preferredCourse) {
        preferredEligibilityLocal = checkCourseEligibility(preferredCourse, score, olevelGrades, interests, utmeSubjects);
        setPreferredEligibility(preferredEligibilityLocal);
        if (preferredEligibilityLocal.eligible) {
          eligibleCourses = eligibleCourses.filter(c => c.course !== preferredCourse);
          eligibleCourses.unshift({ course: preferredCourse, ...preferredEligibilityLocal });
        }
      }

      setEligibleCourses(eligibleCourses);
      toast.success('Recommendations generated successfully!');
    } catch (error) {
      console.error('Recommendation Error:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setRecommendLoading(false);
    }
  };

  const exportJSON = () => {
    const dataStr = JSON.stringify(eligibleCourses, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = 'results.json';
    link.click();
  };

  const exportCSV = () => {
    const headers = ['Course', 'Faculty', 'Cutoff', 'Match Percentage', 'Capacity'];
    const csvRows = eligibleCourses.map(c => [
      c.course,
      c.faculty,
      c.cutoff,
      (c.score * 100).toFixed(0),
      c.capacity
    ]);
    const csvContent = [headers, ...csvRows].map(row => row.join(',')).join('\n');
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = 'results.csv';
    link.click();
  };

  const renderResults = () => {
    if (recommendLoading) return null;

    if (eligibleCourses.length === 0) {
      let recommendationText = `❌ No courses meet your current qualifications.\n\n`;
      if (preferredEligibility && preferredCourse) {
        recommendationText += `Regarding your preferred course "${preferredCourse}", you don't qualify because:\n`;
        preferredEligibility.reasons.forEach(reason => {
          recommendationText += `   • ${reason}\n`;
        });
        recommendationText += `\n`;
      }
      recommendationText += `💡 Recommendations:\n`;
      recommendationText += `• Consider retaking JAMB to improve your score\n`;
      recommendationText += `• Improve O-Level grades in key subjects\n`;
      recommendationText += `• Consider foundation programs\n`;

      return (
        <div className="text-center py-12">
          <FaGraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-500 whitespace-pre-wrap">{recommendationText}</p>
        </div>
      );
    }

    const highMatch = eligibleCourses.filter(c => c.score >= 0.7).length;
    const mediumMatch = eligibleCourses.filter(c => c.score >= 0.4 && c.score < 0.7).length;
    const lowMatch = eligibleCourses.filter(c => c.score < 0.4).length;

    const topCourse = eligibleCourses[0];
    const topMatch = (topCourse.score * 100).toFixed(0);

    const maxScore = Math.max(...eligibleCourses.map(c => c.score));
    const isPreferredTop = topCourse.course === preferredCourse;
    const hasBetter = eligibleCourses.length > 1 && eligibleCourses[0].score < maxScore; // if preferred is top but lower score

    return (
      <div>
        {preferredEligibility && preferredCourse && !preferredEligibility.eligible && (
          <div className="bg-red-800 rounded-lg p-4 mb-4 text-white">
            <h3 className="font-bold mb-2">Your Preferred Course: {preferredCourse}</h3>
            <p>Unfortunately, you don't qualify because:</p>
            <ul className="list-disc pl-5">
              {preferredEligibility.reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaTrophy className="text-yellow-400" />
              <span className="text-white font-semibold">Top Recommendation</span>
            </div>
            <div className="bg-green-600 rounded-full px-3 py-1 text-white text-sm">{topMatch}% Match</div>
          </div>
          <h3 className="text-xl font-bold text-white mt-2">{topCourse.course}</h3>
          <p className="text-gray-400">{topCourse.faculty}</p>
          <p className="text-gray-400">Cutoff: {topCourse.cutoff}</p>
          <p className="text-gray-400">Capacity: {topCourse.capacity}</p>
          <div className="mt-2">
            <span className="text-gray-300">Career Prospects:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {topCourse.careerProspects.map((career, idx) => (
                <div key={idx} className="bg-blue-600 rounded px-2 py-1 text-white text-sm">{career}</div>
              ))}
            </div>
          </div>
          {isPreferredTop && hasBetter && (
            <p className="text-yellow-400 mt-2">Note: You have a better chance in other courses with higher match, but we prioritized your preferred.</p>
          )}
        </div>
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <h3 className="text-white font-semibold mb-2">Prediction Statistics</h3>
          <div className="flex justify-around text-center">
            <div>
              <p className="text-green-500 font-bold">{highMatch}</p>
              <p className="text-gray-400 text-sm">High Match (70%+)</p>
            </div>
            <div>
              <p className="text-yellow-500 font-bold">{mediumMatch}</p>
              <p className="text-gray-400 text-sm">Medium Match (40-70%)</p>
            </div>
            <div>
              <p className="text-red-500 font-bold">{lowMatch}</p>
              <p className="text-gray-400 text-sm">Low Match (&lt;40%)</p>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-white font-semibold mb-2">All Eligible Courses ({eligibleCourses.length})</h3>
          <div className="space-y-3">
            {eligibleCourses.map((course, index) => {
              const match = (course.score * 100).toFixed(0);
              const isBest = course.score === maxScore;
              return (
                <div key={index} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-semibold">{course.course}</h4>
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-400" />
                      <span className="text-white">{match}%</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">{course.faculty}</p>
                  <p className="text-gray-400 text-sm">Cutoff: {course.cutoff}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {course.careerProspects.map((career, idx) => (
                      <div key={idx} className="bg-gray-600 rounded px-2 py-1 text-gray-300 text-sm">{career}</div>
                    ))}
                  </div>
                  {isBest && <div className="bg-yellow-600 rounded px-2 py-1 text-white text-sm inline-block mt-2">Best Match</div>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportJSON} className="bg-green-600 text-white px-4 py-2 rounded">JSON</button>
          <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded">CSV</button>
        </div>
      </div>
    );
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setQuestions('');

    if (!selectedFile) return;

    if (selectedFile.type !== 'text/plain') {
      toast.error('Please upload a .txt file');
      fileInputRef.current.value = '';
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      fileInputRef.current.value = '';
      return;
    }

    setFile(selectedFile);
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setQuestionLoading(true);
    setQuestions('');

    try {
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });

      const generatedQuestions = await deepseekService.generateQuestions(text);
      setQuestions(generatedQuestions);
      toast.success('Questions generated successfully!');
    } catch (error) {
      console.error('Question Generation Error:', error);
      toast.error(error.message || 'Failed to generate questions');
    } finally {
      setQuestionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 px-2 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
            <FaGraduationCap className="text-green-600" /> FUTA Course Advisor
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Get personalized course recommendations based on your qualifications and interests
          </p>
        </div>
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setSelectedIndex(0)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedIndex === 0
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Individual Prediction
            </button>
            <button
              onClick={() => setSelectedIndex(1)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedIndex === 1
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Help & FAQ
            </button>
          </div>
        </div>
        {selectedIndex === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="rounded-lg shadow-lg p-6 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Enter Your Details</h2>
              <form onSubmit={handleRecommendationSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Full Name</label>
                    <input
                      type="text"
                      value={"Regular User"}
                      readOnly
                      className="w-full p-3 rounded-lg border bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">JAMB Score (0-400)</label>
                    <input
                      type="number"
                      min="0"
                      max="400"
                      value={jambScore}
                      onChange={(e) => setJambScore(e.target.value)}
                      className="w-full p-3 rounded-lg border bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      required
                      placeholder="Enter your UTME score"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Preferred Course</label>
                    <select
                      value={preferredCourse}
                      onChange={e => setPreferredCourse(e.target.value)}
                      className="w-full p-3 rounded-lg border bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    >
                      <option value="">Select preferred course</option>
                      {COURSE_LIST.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">State of Origin</label>
                    <select
                      value={stateOfOrigin}
                      onChange={e => setStateOfOrigin(e.target.value)}
                      className="w-full p-3 rounded-lg border bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    >
                      <option value="">Select state</option>
                      {STATE_LIST.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Gender</label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      className="w-full p-3 rounded-lg border bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    >
                      <option value="">Select gender</option>
                      {GENDER_LIST.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* UTME Subjects */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">UTME Subjects (Select exactly 4, including English Language)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    {["English Language", "Mathematics", "Physics", "Chemistry", "Biology", "Economics", "Geography", "Agricultural Science", "Fine Art", "Government", "Literature in English"].map(subject => (
                      <label key={subject} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={utmeSubjects.includes(subject)}
                          onChange={e => {
                            if (e.target.checked) {
                              if (utmeSubjects.length < 4) setUtmeSubjects([...utmeSubjects, subject]);
                            } else {
                              if (subject !== "English Language") setUtmeSubjects(utmeSubjects.filter(s => s !== subject));
                            }
                          }}
                          disabled={subject === "English Language" || (utmeSubjects.length >= 4 && !utmeSubjects.includes(subject))}
                          className="rounded text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* O-Level Subjects and Grades (Select at least 5) */}
                <div>
                  <h3 className="text-lg font-medium text-green-700 dark:text-green-400 mb-2">
                    O-Level Subjects and Grades (Select at least 5)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {OLEVEL_SUBJECTS.map(subject => (
                      <div key={subject} className="flex items-center space-x-2">
                        <span className="text-gray-700 dark:text-gray-300 font-semibold w-32">{subject}</span>
                        <select
                          value={olevelGrades[subject] || ''}
                          onChange={e => setOlevelGrades({ ...olevelGrades, [subject]: e.target.value })}
                          className="form-select block w-32 rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Grade</option>
                          {GRADES.map(grade => (
                            <option key={grade} value={grade}>{grade}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Interests */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Interests and Career Goals</label>
                  <textarea
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows="3"
                    required
                    placeholder="What subjects do you enjoy? What career interests you?"
                  />
                </div>
                <ProgressBar loading={recommendLoading} />
                <button
                  type="submit"
                  disabled={recommendLoading}
                  className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${recommendLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {recommendLoading ? 'Getting Recommendations...' : 'Predict Admission'}
                </button>
              </form>
            </div>
            {/* Results Section */}
            <div className="rounded-lg shadow-lg p-6 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Prediction Results</h2>
              {eligibleCourses.length === 0 && !recommendLoading ? (
                <div className="text-center py-12">
                  <FaGraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg text-gray-500">Fill out the form and click "Predict Admission" to see your results</p>
                </div>
              ) : renderResults()}
            </div>
          </div>
        )}
        {selectedIndex === 1 && (
          <div className="rounded-lg shadow-lg p-6 bg-white dark:bg-gray-800">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Help & FAQ</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">How does the course advisor work?</h3>
                <p className="text-gray-600 dark:text-gray-400">Our system analyzes your JAMB score, O-Level grades, and interests to recommend eligible courses at FUTA. It considers course requirements and your academic profile for personalized suggestions.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">What information do I need to provide?</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                  <li>JAMB score (0-400)</li>
                  <li>O-Level grades for at least 5 subjects</li>
                  <li>Your interests and career goals</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">How accurate are the recommendations?</h3>
                <p className="text-gray-600 dark:text-gray-400">Recommendations are based on FUTA's requirements and your input. Actual admission depends on many factors, so use this as a guide.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">What if I'm not eligible for any course?</h3>
                <p className="text-gray-600 dark:text-gray-400">If no courses are recommended, consider improving your JAMB score or O-Level grades, or explore alternative programs.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseAdvisor;
