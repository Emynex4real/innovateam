import React, { useState, useEffect } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import toast from 'react-hot-toast';
import debounce from 'lodash/debounce';
import deepseekService from '../../services/deepseek.service';
import { 
  GraduationCap, 
  CheckCircle, 
  AlertCircle, 
  Star, 
  Trophy, 
  Target,
  BookOpen,
  TrendingUp,
  Users,
  Award,
  Download,
  FileText,
  BarChart3,
  Sparkles,
  Brain,
  Zap,
  Filter,
  Search,
  ChevronDown,
  Info,
  HelpCircle
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { Separator } from '../../components/ui/separator';
import { cn } from '../../lib/utils';

// Create debounced API call function
const debouncedApiCall = debounce((request) => request(), 1000);

const GRADES = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'];
const OLEVEL_SUBJECTS = [
  "English Language", "Mathematics", "Physics", "Chemistry", "Biology", "Economics", "Geography",
  "Agricultural Science", "Further Mathematics", "Government", "Literature in English", "Fine Art",
  "Technical Drawing", "Commerce", "Accounting", "Computer Studies", "Civic Education", "CRS", "IRS"
];

const ProgressBar = ({ loading }) => (
  loading ? (
    <div className="w-full bg-green-100 dark:bg-green-900/20 rounded-full h-2 mb-4">
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
    </div>
  ) : null
);

const StatCard = ({ icon: Icon, title, value, description, color = "blue" }) => {
  const colorClasses = {
    blue: {
      text: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/20"
    },
    green: {
      text: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/20"
    },
    yellow: {
      text: "text-yellow-600 dark:text-yellow-400",
      bg: "bg-yellow-100 dark:bg-yellow-900/20"
    }
  };
  
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${colorClasses[color].text}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color].bg}`}>
            <Icon className={`h-6 w-6 ${colorClasses[color].text}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const GradeSelector = ({ subject, value, onChange }) => (
  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
    <Label className="font-medium text-sm">{subject}</Label>
    <select
      value={value || ''}
      onChange={(e) => onChange(subject, e.target.value)}
      className="w-20 p-1 text-sm border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent bg-background"
    >
      <option value="">Grade</option>
      {GRADES.map(grade => (
        <option key={grade} value={grade}>{grade}</option>
      ))}
    </select>
  </div>
);

const CourseCard = ({ course, index, maxScore }) => {
  const match = (course.score * 100).toFixed(0);
  const isBest = course.score === maxScore;
  const isHighMatch = course.score >= 0.7;
  const isMediumMatch = course.score >= 0.4 && course.score < 0.7;
  
  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg",
      isBest && "ring-2 ring-yellow-400 shadow-lg",
      isHighMatch && !isBest && "border-green-200 dark:border-green-800",
      isMediumMatch && "border-yellow-200 dark:border-yellow-800"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-lg">{course.course}</h4>
              {isBest && <Award className="h-5 w-5 text-yellow-500" />}
            </div>
            <p className="text-sm text-muted-foreground mb-1">{course.faculty}</p>
            <p className="text-xs text-muted-foreground">Cutoff: {course.cutoff} | Capacity: {course.capacity}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              isHighMatch ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
              isMediumMatch ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400" :
              "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            )}>
              {match}% Match
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Career Prospects</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {course.careerProspects.slice(0, 3).map((career, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded">
                  {career}
                </span>
              ))}
            </div>
          </div>
          
          {isBest && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/10 rounded border border-yellow-200 dark:border-yellow-800">
              <Sparkles className="h-4 w-4 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">Top Recommendation</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const CourseAdvisor = () => {
  // Expanded FUTA Course Database with accurate requirements and UTME subject combinations
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

  const GRADE_POINTS = {
    "A1": 9, "B2": 8, "B3": 7, "C4": 6, "C5": 5, "C6": 4
  };

  // Mock user data for collaborative filtering (in real app, fetch from API)
  const mockUsers = [
    { id: 1, jamb: 220, gpa: 7.5, interests: ['technology', 'engineering'], courses: ['Computer Science', 'Computer Engineering'] },
    { id: 2, jamb: 190, gpa: 6.0, interests: ['agriculture', 'science'], courses: ['Agricultural Engineering', 'Biotechnology'] },
    // Add more mock data as needed
  ];

  const calculateGPA = (grades) => {
    const validGrades = Object.values(grades).filter(grade => grade && GRADE_POINTS[grade]);
    if (validGrades.length === 0) return 0;
    const totalPoints = validGrades.reduce((sum, grade) => sum + GRADE_POINTS[grade], 0);
    return totalPoints / validGrades.length;
  };

  const getCourseSimilarity = (course1, course2) => {
    const interests1 = new Set(FUTA_COURSES[course1].interests);
    const interests2 = new Set(FUTA_COURSES[course2].interests);
    const intersection = new Set([...interests1].filter(i => interests2.has(i)));
    return intersection.size / Math.max(interests1.size, interests2.size);
  };

  const getCollaborativeScore = (userJamb, userGpa, userInterests, course) => {
    const similarUsers = mockUsers.map(u => {
      const jambSim = 1 - Math.abs(userJamb - u.jamb) / 400;
      const gpaSim = 1 - Math.abs(userGpa - u.gpa) / 9;
      const interestSim = userInterests.filter(i => u.interests.includes(i)).length / Math.max(userInterests.length, u.interests.length);
      const similarity = (jambSim + gpaSim + interestSim) / 3;
      return { similarity, courses: u.courses };
    }).sort((a, b) => b.similarity - a.similarity).slice(0, 3);

    return similarUsers.reduce((sum, u) => sum + (u.courses.includes(course) ? u.similarity : 0), 0) / 3;
  };

  const checkCourseEligibility = async (course, jambScore, olevelGrades, interests, utmeSubjects) => {
    const courseData = FUTA_COURSES[course];
    if (!courseData) return { eligible: false, score: 0, reasons: [] };

    let score = 0;
    const reasons = [];

    // Check JAMB score (30% weight, reduced for hybrid)
    if (jambScore >= courseData.cutoff) {
      const jambScore_normalized = Math.min((jambScore - courseData.cutoff + 50) / 100, 1);
      score += jambScore_normalized * 0.3;
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

    // Content-based interest alignment (20% weight)
    const selectedInterests = interests.split(',').map(i => i.trim().toLowerCase()).filter(Boolean);
    const interestWords = selectedInterests.join(' ').split(/\s+/);
    const matchingInterests = courseData.interests.filter(interest => 
      interestWords.some(word => word.includes(interest) || interest.includes(word))
    );
    const interestScore = matchingInterests.length / Math.max(courseData.interests.length, 1);
    score += interestScore * 0.2;
    reasons.push(`Interest Match: ${(interestScore * 100).toFixed(0)}% (${matchingInterests.join(', ')})`);

    // Collaborative score (20% weight)
    const collabScore = getCollaborativeScore(jambScore, calculateGPA(olevelGrades), selectedInterests, course);
    score += collabScore * 0.2;
    reasons.push(`Collaborative Match: ${(collabScore * 100).toFixed(0)}%`);

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
      
      // Check eligibility for all courses with hybrid scoring
      for (const courseName of Object.keys(FUTA_COURSES)) {
        const eligibility = await checkCourseEligibility(courseName, score, olevelGrades, interests, utmeSubjects);
        if (eligibility.eligible) {
          eligibleCourses.push({
            course: courseName,
            ...eligibility
          });
        }
      }

      // Sort by score (highest first)
      eligibleCourses.sort((a, b) => b.score - a.score);

      let preferredEligibilityLocal = null;
      if (preferredCourse) {
        preferredEligibilityLocal = await checkCourseEligibility(preferredCourse, score, olevelGrades, interests, utmeSubjects);
        setPreferredEligibility(preferredEligibilityLocal);
        if (preferredEligibilityLocal.eligible) {
          eligibleCourses = eligibleCourses.filter(c => c.course !== preferredCourse);
          eligibleCourses.unshift({ course: preferredCourse, ...preferredEligibilityLocal });
        } else {
          // Find alternatives from same faculty, related, less competitive
          const preferredData = FUTA_COURSES[preferredCourse];
          if (preferredData) {
            const sameFacultyCourses = eligibleCourses.filter(c => c.faculty === preferredData.faculty);
            sameFacultyCourses.sort((a, b) => {
              const simA = getCourseSimilarity(preferredCourse, a.course);
              const simB = getCourseSimilarity(preferredCourse, b.course);
              const compA = (a.cutoff - preferredData.cutoff) + (preferredData.capacity - a.capacity) / 100; // Lower cutoff, higher capacity better
              const compB = (b.cutoff - preferredData.cutoff) + (preferredData.capacity - b.capacity) / 100;
              return (simB - simA) || (compA - compB);
            });
            const otherCourses = eligibleCourses.filter(c => c.faculty !== preferredData.faculty);
            eligibleCourses = sameFacultyCourses.concat(otherCourses);
          }
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
      return (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Eligible Courses Found</h3>
          <p className="text-muted-foreground mb-4">
            Based on your current qualifications, no courses meet the admission requirements.
          </p>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium">💡 Recommendations:</p>
            <div className="flex flex-col gap-1">
              <span>• Consider retaking JAMB to improve your score</span>
              <span>• Improve O-Level grades in key subjects</span>
              <span>• Explore foundation programs</span>
              <span>• Consider alternative pathways</span>
            </div>
          </div>
        </div>
      );
    }

    const highMatch = eligibleCourses.filter(c => c.score >= 0.7).length;
    const mediumMatch = eligibleCourses.filter(c => c.score >= 0.4 && c.score < 0.7).length;
    const lowMatch = eligibleCourses.filter(c => c.score < 0.4).length;
    const maxScore = Math.max(...eligibleCourses.map(c => c.score));
    const topCourse = eligibleCourses[0];

    return (
      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            icon={TrendingUp}
            title="High Match"
            value={highMatch}
            description="70%+ compatibility"
            color="green"
          />
          <StatCard
            icon={Target}
            title="Medium Match"
            value={mediumMatch}
            description="40-70% compatibility"
            color="yellow"
          />
          <StatCard
            icon={Users}
            title="Total Eligible"
            value={eligibleCourses.length}
            description="Courses available"
            color="blue"
          />
        </div>

        {/* Top Recommendation */}
        <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-green-800 dark:text-green-200">Top Recommendation</span>
              </div>
              <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {(topCourse.score * 100).toFixed(0)}% Match
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-2">{topCourse.course}</h3>
            <p className="text-muted-foreground mb-4">{topCourse.faculty} • Cutoff: {topCourse.cutoff} • Capacity: {topCourse.capacity}</p>
            
            {/* Better Chance Notice */}
            {preferredCourse && topCourse.course === preferredCourse && eligibleCourses.length > 1 && eligibleCourses[1].score > topCourse.score && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">Note:</p>
                    <p className="text-blue-700 dark:text-blue-300">
                      You have a better chance in other courses with higher match ({(eligibleCourses[1].score * 100).toFixed(0)}% vs {(topCourse.score * 100).toFixed(0)}%), but we prioritized your preferred choice.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Career Prospects</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {topCourse.careerProspects.map((career, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded">
                      {career}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Match Analysis</Label>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  {topCourse.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Courses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">All Eligible Courses ({eligibleCourses.length})</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportJSON}>
                <Download className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <FileText className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {eligibleCourses.map((course, index) => (
              <CourseCard
                key={index}
                course={course}
                index={index}
                maxScore={maxScore}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Compact Header */}
      <div className="bg-white dark:bg-slate-900 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FUTA Course Advisor</h1>
                <p className="text-sm text-muted-foreground">AI-powered course recommendations</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Brain className="h-3 w-3" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Target className="h-3 w-3" />
                <span>Personalized</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Zap className="h-3 w-3" />
                <span>Real-time</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border">
            <Button
              variant={selectedIndex === 0 ? "default" : "ghost"}
              onClick={() => setSelectedIndex(0)}
              className="flex-1 justify-center"
            >
              <Target className="h-4 w-4 mr-2" />
              Course Prediction
            </Button>
            <Button
              variant={selectedIndex === 1 ? "default" : "ghost"}
              onClick={() => setSelectedIndex(1)}
              className="flex-1 justify-center"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Help & FAQ
            </Button>
          </div>
        </div>

        {selectedIndex === 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="xl:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    Academic Profile
                  </CardTitle>
                  <CardDescription>
                    Enter your academic details for personalized course recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleRecommendationSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value="Regular User"
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jamb">JAMB Score (0-400)</Label>
                        <Input
                          id="jamb"
                          type="number"
                          min="0"
                          max="400"
                          value={jambScore}
                          onChange={(e) => setJambScore(e.target.value)}
                          placeholder="Enter your UTME score"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="preferred">Preferred Course (Optional)</Label>
                        <select
                          id="preferred"
                          value={preferredCourse}
                          onChange={e => setPreferredCourse(e.target.value)}
                          className="w-full p-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Select preferred course</option>
                          {COURSE_LIST.map(course => (
                            <option key={course} value={course}>{course}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State of Origin</Label>
                        <select
                          id="state"
                          value={stateOfOrigin}
                          onChange={e => setStateOfOrigin(e.target.value)}
                          className="w-full p-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Select state</option>
                          {STATE_LIST.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        className="w-full p-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select gender</option>
                        {GENDER_LIST.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <Separator />

                    {/* UTME Subjects */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-semibold">UTME Subjects</Label>
                        <p className="text-sm text-muted-foreground">Select exactly 4 subjects (English Language is mandatory)</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {["English Language", "Mathematics", "Physics", "Chemistry", "Biology", "Economics", "Geography", "Agricultural Science", "Fine Art", "Government", "Literature in English"].map(subject => (
                          <div key={subject} className="flex items-center space-x-2">
                            <Checkbox
                              id={subject}
                              checked={utmeSubjects.includes(subject)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  if (utmeSubjects.length < 4) setUtmeSubjects([...utmeSubjects, subject]);
                                } else {
                                  if (subject !== "English Language") setUtmeSubjects(utmeSubjects.filter(s => s !== subject));
                                }
                              }}
                              disabled={subject === "English Language" || (utmeSubjects.length >= 4 && !utmeSubjects.includes(subject))}
                            />
                            <Label htmlFor={subject} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {subject}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Selected: {utmeSubjects.length}/4 subjects
                      </p>
                    </div>

                    <Separator />

                    {/* O-Level Subjects */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-semibold">O-Level Results</Label>
                        <p className="text-sm text-muted-foreground">Select grades for at least 5 subjects</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {OLEVEL_SUBJECTS.map(subject => (
                          <GradeSelector
                            key={subject}
                            subject={subject}
                            value={olevelGrades[subject]}
                            onChange={(subj, grade) => setOlevelGrades({ ...olevelGrades, [subj]: grade })}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Selected: {Object.keys(olevelGrades).filter(subj => olevelGrades[subj]).length} subjects
                      </p>
                    </div>

                    <Separator />

                    {/* Interests */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-semibold">Interests (Select up to 3)</Label>
                        <p className="text-sm text-muted-foreground">Choose your main areas of interest to get better recommendations</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          "Technology & Innovation",
                          "Engineering & Design", 
                          "Environmental Sciences",
                          "Business & Management",
                          "Health Sciences",
                          "Agriculture & Food Security"
                        ].map(interest => {
                          const selectedInterests = interests.split(',').map(i => i.trim()).filter(Boolean);
                          const isSelected = selectedInterests.includes(interest);
                          const canSelect = selectedInterests.length < 3 || isSelected;
                          
                          return (
                            <div key={interest} className="flex items-center space-x-2">
                              <Checkbox
                                id={interest}
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  if (checked && canSelect) {
                                    setInterests(selectedInterests.concat(interest).join(', '));
                                  } else if (!checked) {
                                    setInterests(selectedInterests.filter(i => i !== interest).join(', '));
                                  }
                                }}
                                disabled={!canSelect}
                              />
                              <Label htmlFor={interest} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {interest}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Selected: {interests.split(',').map(i => i.trim()).filter(Boolean).length}/3 interests
                      </p>
                    </div>

                    <ProgressBar loading={recommendLoading} />
                    
                    <Button
                      type="submit"
                      disabled={recommendLoading}
                      className="w-full h-12 text-base font-semibold"
                      size="lg"
                    >
                      {recommendLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analyzing Your Profile...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Get My Course Recommendations
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Prediction Results
                  </CardTitle>
                  <CardDescription>
                    Your personalized course recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {eligibleCourses.length === 0 && !recommendLoading ? (
                    <div className="text-center py-12">
                      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                        <GraduationCap className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Ready to Discover Your Path?</h3>
                      <p className="text-muted-foreground mb-4">
                        Fill out your academic profile to get personalized course recommendations
                      </p>
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>AI-powered matching</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Real FUTA requirements</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Career prospects included</span>
                        </div>
                      </div>
                    </div>
                  ) : renderResults()}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {selectedIndex === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  How It Works
                </CardTitle>
                <CardDescription>
                  Understanding our AI-powered recommendation system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Academic Analysis</h4>
                      <p className="text-sm text-muted-foreground">We analyze your JAMB score, O-Level grades, and UTME subjects against FUTA's admission requirements.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Interest Matching</h4>
                      <p className="text-sm text-muted-foreground">Our AI matches your interests and career goals with course content and career prospects.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Smart Recommendations</h4>
                      <p className="text-sm text-muted-foreground">Get ranked course suggestions with match percentages and detailed explanations.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-orange-600" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">What information do I need?</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• JAMB/UTME score (0-400)</li>
                    <li>• O-Level grades (at least 5 subjects)</li>
                    <li>• UTME subject combination</li>
                    <li>• Your interests and career goals</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">How accurate are the recommendations?</h4>
                  <p className="text-sm text-muted-foreground">
                    Our recommendations are based on official FUTA requirements and historical data. However, actual admission depends on various factors including competition and policy changes.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">What if I'm not eligible for any course?</h4>
                  <p className="text-sm text-muted-foreground">
                    Consider retaking JAMB for a higher score, improving O-Level grades, or exploring foundation programs and alternative pathways.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Can I save my results?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! You can export your recommendations as JSON or CSV files for future reference and planning.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseAdvisor;