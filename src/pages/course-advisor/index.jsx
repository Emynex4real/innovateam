import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, GraduationCap, TrendingUp, CheckCircle2, XCircle, 
  Sparkles, ChevronRight, Brain, Calculator, User, AlertTriangle, 
  MapPin, Briefcase, Award, ArrowRight, ShieldCheck, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { useDarkMode } from '../../contexts/DarkModeContext';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

// --- 1. CONFIGURATION ---
const GRADE_POINTS = { 
  'A1': 10, 'B2': 9, 'B3': 8, 'C4': 7, 'C5': 6, 'C6': 5, 
  'D7': 0, 'E8': 0, 'F9': 0 
};

const CATCHMENT_STATES = ["Ekiti", "Lagos", "Ogun", "Ondo", "Osun", "Oyo"];
const ALL_STATES = ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"];

const SUBJECTS_LIST = [
  "Mathematics", "English Language", "Physics", "Chemistry", "Biology", 
  "Economics", "Government", "Literature-in-English", "Geography", "Agric Science", 
  "Further Math", "Computer Studies", "Civic Education", "Commerce", "Accounting", "CRS/IRS", "History", "Yoruba", "Igbo", "Hausa", "French", "Visual Arts", "Music"
];

// --- 2. ROBUST COURSE DATABASE (60+ Courses) ---
const COURSE_DB = {
  // === COLLEGE OF MEDICINE & DENTAL SCIENCES ===
  "Medicine & Surgery": {
    faculty: "Clinical Sciences", cutoff: 85.025, min_jamb: 270,
    utme_req: ["English Language", "Biology", "Chemistry", "Physics"],
    waec_req: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics"],
    waec_sitting: "One Sitting",
    salary: "Very High", demand: "Very High"
  },
  "Dentistry": {
    faculty: "Dental Sciences", cutoff: 76.65, min_jamb: 260,
    utme_req: ["English Language", "Biology", "Chemistry", "Physics"],
    waec_req: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics"],
    waec_sitting: "One Sitting",
    salary: "Very High", demand: "High"
  },
  "Nursing Science": {
    faculty: "Clinical Sciences", cutoff: 79.80, min_jamb: 250,
    utme_req: ["English Language", "Physics", "Biology", "Chemistry"],
    waec_req: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics"],
    waec_sitting: "One Sitting",
    salary: "High", demand: "Very High"
  },
  "Radiography": {
    faculty: "Clinical Sciences", cutoff: 77.375, min_jamb: 240,
    utme_req: ["English Language", "Physics", "Biology", "Chemistry"],
    waec_req: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics"],
    waec_sitting: "One Sitting",
    salary: "High", demand: "High"
  },
  "Medical Laboratory Science": {
    faculty: "Clinical Sciences", cutoff: 74.375, min_jamb: 240,
    utme_req: ["English Language", "Physics", "Biology", "Chemistry"],
    waec_req: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics"],
    waec_sitting: "One Sitting",
    salary: "High", demand: "High"
  },
  "Physiotherapy": {
    faculty: "Clinical Sciences", cutoff: 74.725, min_jamb: 240,
    utme_req: ["English Language", "Physics", "Biology", "Chemistry"],
    waec_req: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics"],
    waec_sitting: "One Sitting",
    salary: "High", demand: "High"
  },
  "Pharmacology": {
    faculty: "Basic Medical Sciences", cutoff: 73.125, min_jamb: 230,
    utme_req: ["English Language", "Physics", "Biology", "Chemistry"],
    waec_req: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics"],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "Medium"
  },
  "Physiology": {
    faculty: "Basic Medical Sciences", cutoff: 72.875, min_jamb: 220,
    utme_req: ["English Language", "Biology", "Physics", "Chemistry"],
    waec_req: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics"],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "Medium"
  },
  "Pharmacy": {
    faculty: "Pharmacy", cutoff: 76.40, min_jamb: 250,
    utme_req: ["English Language", "Physics", "Biology", "Chemistry"],
    waec_req: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics"],
    waec_sitting: "One Sitting",
    salary: "Very High", demand: "High"
  },

  // === FACULTY OF COMPUTING & INFORMATICS ===
  "Computer Science": {
    faculty: "Computing & Informatics", cutoff: 83.425, min_jamb: 260,
    utme_req: [
      "English Language", 
      "Mathematics", 
      "Physics", 
      ["Chemistry", "Economics", "Biology", "Geography"]
    ],
    waec_req: ["English Language", "Mathematics", "Physics", "Chemistry", "Further Math"],
    waec_sitting: "One Sitting",
    salary: "Very High", demand: "Explosive"
  },
  "Data Science": {
    faculty: "Computing & Informatics", cutoff: 76.925, min_jamb: 250,
    utme_req: [
      "English Language", 
      "Mathematics", 
      "Physics", 
      ["Chemistry", "Economics", "Biology", "Geography"]
    ],
    waec_req: ["English Language", "Mathematics", "Physics", "Chemistry", "Further Math"],
    waec_sitting: "One Sitting",
    salary: "Very High", demand: "Explosive"
  },

  // === FACULTY OF ENGINEERING ===
  "Computer Engineering": {
    faculty: "Engineering", cutoff: 82.875, min_jamb: 260,
    utme_req: ["English Language", "Mathematics", "Physics", "Chemistry"],
    waec_req: ["English Language", "Mathematics", "Physics", "Chemistry", "Further Math"],
    waec_sitting: "One Sitting",
    salary: "Very High", demand: "Explosive"
  },
  "Electrical & Electronics Engineering": {
    faculty: "Engineering", cutoff: 79.50, min_jamb: 250,
    utme_req: ["English Language", "Mathematics", "Physics", "Chemistry"],
    waec_req: ["Mathematics", "English Language", "Physics", "Chemistry", "Further Math"],
    waec_sitting: "One Sitting",
    salary: "Very High", demand: "High"
  },
  "Mechanical Engineering": {
    faculty: "Engineering", cutoff: 78.525, min_jamb: 240,
    utme_req: ["English Language", "Mathematics", "Physics", "Chemistry"],
    waec_req: ["Mathematics", "English Language", "Physics", "Chemistry", "Further Math"],
    waec_sitting: "One Sitting",
    salary: "High", demand: "High"
  },
  "Systems Engineering": {
    faculty: "Engineering", cutoff: 78.225, min_jamb: 240,
    utme_req: ["English Language", "Mathematics", "Physics", "Chemistry"],
    waec_req: ["English Language", "Mathematics", "Physics", "Chemistry", "Further Math"],
    waec_sitting: "One Sitting",
    salary: "Very High", demand: "High"
  },
  "Civil Engineering": {
    faculty: "Engineering", cutoff: 75.625, min_jamb: 230,
    utme_req: ["English Language", "Mathematics", "Physics", "Chemistry"],
    waec_req: ["Mathematics", "English Language", "Physics", "Chemistry", "Further Math"],
    waec_sitting: "One Sitting",
    salary: "High", demand: "High"
  },
  "Chemical Engineering": {
    faculty: "Engineering", cutoff: 74.50, min_jamb: 230,
    utme_req: ["English Language", "Mathematics", "Physics", "Chemistry"],
    waec_req: ["Mathematics", "English Language", "Physics", "Chemistry", "Further Math"],
    waec_sitting: "One Sitting",
    salary: "High", demand: "High"
  },
  "Petroleum & Gas Engineering": {
    faculty: "Engineering", cutoff: 70.725, min_jamb: 230,
    utme_req: ["English Language", "Mathematics", "Physics", "Chemistry"],
    waec_req: ["Mathematics", "English Language", "Physics", "Chemistry", "Further Math"],
    waec_sitting: "One Sitting",
    salary: "Very High", demand: "Medium"
  },
  "Surveying & Geoinformatics": {
    faculty: "Engineering", cutoff: 58.125, min_jamb: 200,
    utme_req: ["English Language", "Mathematics", "Physics", "Chemistry"],
    waec_req: ["Mathematics", "English Language", "Physics", "Chemistry", "Further Math"],
    waec_sitting: "One Sitting",
    salary: "High", demand: "Medium"
  },

  // === FACULTY OF SCIENCE ===
  "Microbiology": {
    faculty: "Science", cutoff: 70.05, min_jamb: 200,
    utme_req: ["English Language", "Biology", "Chemistry", "Physics"],
    waec_req: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics"],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "High"
  },
  "Biochemistry": {
    faculty: "Science", cutoff: 66.55, min_jamb: 200,
    utme_req: ["English Language", "Biology", "Chemistry", "Physics"],
    waec_req: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics"],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "Medium"
  },
  "Geology": {
    faculty: "Science", cutoff: 65.50, min_jamb: 200,
    utme_req: [
      "English Language", 
      "Mathematics",
      "Physics",
      ["Chemistry", "Geography"]
    ],
    waec_req: ["English Language", "Mathematics", "Physics", "Chemistry", "Biology"],
    waec_sitting: "One Sitting",
    salary: "High", demand: "Medium"
  },
  "Geophysics": {
    faculty: "Science", cutoff: 64.20, min_jamb: 200,
    utme_req: [
      "English Language", 
      "Mathematics",
      "Physics",
      ["Chemistry", "Geography"]
    ],
    waec_req: ["English Language", "Mathematics", "Physics", "Chemistry", "Biology"],
    waec_sitting: "One Sitting",
    salary: "High", demand: "Medium"
  },
  "Industrial Chemistry": {
    faculty: "Science", cutoff: 62.10, min_jamb: 200,
    utme_req: ["English Language", "Chemistry", "Mathematics", "Physics"],
    waec_req: ["Mathematics", "English Language", "Chemistry", "Physics", "Biology"],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "High"
  },
  "Marine Biology": {
    faculty: "Science", cutoff: 60.50, min_jamb: 200,
    utme_req: ["English Language", "Biology", "Chemistry", "Physics"],
    waec_req: ["English Language", "Mathematics", "Biology", "Chemistry", "Physics"],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "Low"
  },
  "Mathematics & Statistics": {
    faculty: "Science", cutoff: 68.50, min_jamb: 200,
    utme_req: [
      "English Language", 
      "Mathematics", 
      "Physics", 
      ["Chemistry", "Economics", "Geography"]
    ],
    waec_req: ["English Language", "Mathematics", "Physics", "Chemistry", "Further Math"],
    waec_sitting: "One Sitting",
    salary: "High", demand: "Medium"
  },
  "Fisheries": {
    faculty: "Science", cutoff: 55.40, min_jamb: 200,
    utme_req: ["English Language", "Biology", "Chemistry", "Physics"],
    waec_req: [
      "English Language", 
      "Mathematics", 
      "Biology", 
      "Chemistry", 
      ["Physics", "Agricultural Science"]
    ],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "Low"
  },

  // === MANAGEMENT SCIENCES ===
  "Accounting": {
    faculty: "Management Sciences", cutoff: 75.70, min_jamb: 250,
    utme_req: [
      "English Language", 
      "Mathematics", 
      "Economics", 
      ["Financial Accounting", "Further Mathematics", "Geography", "Government", "Biology"]
    ],
    waec_req: [
      "Mathematics", 
      "English Language", 
      "Economics", 
      "Financial Accounting", 
      ["Government", "Further Mathematics", "Geography"]
    ],
    waec_sitting: "One Sitting",
    salary: "High", demand: "Very High"
  },
  "Finance": {
    faculty: "Management Sciences", cutoff: 73.20, min_jamb: 230,
    utme_req: [
      "English Language", 
      "Mathematics", 
      "Economics", 
      ["Financial Accounting", "Further Mathematics", "Geography", "Government", "Biology"]
    ],
    waec_req: [
      "Mathematics", 
      "English Language", 
      "Economics", 
      "Government", 
      ["Financial Accounting", "Further Mathematics", "Geography"]
    ],
    waec_sitting: "One Sitting",
    salary: "Very High", demand: "High"
  },
  "Business Administration": {
    faculty: "Management Sciences", cutoff: 71.50, min_jamb: 220,
    utme_req: [
      "English Language", 
      "Mathematics", 
      "Economics", 
      ["Government", "Financial Accounting", "Commerce", "Geography"]
    ],
    waec_req: [
      "Mathematics", 
      "English Language", 
      "Economics", 
      "Government", 
      ["Commerce", "Financial Accounting", "Geography"]
    ],
    waec_sitting: "One Sitting",
    salary: "High", demand: "High"
  },
  "Actuarial Science": {
    faculty: "Management Sciences", cutoff: 70.80, min_jamb: 220,
    utme_req: [
      "English Language", 
      "Mathematics", 
      "Economics", 
      ["Geography", "Government", "Physics", "Chemistry", "Biology"]
    ],
    waec_req: [
      "Mathematics", 
      "English Language", 
      "Economics", 
      "Further Mathematics",
      ["Geography", "Government", "Financial Accounting"]
    ],
    waec_sitting: "One Sitting",
    salary: "Very High", demand: "High"
  },
  "Insurance": {
    faculty: "Management Sciences", cutoff: 68.50, min_jamb: 210,
    utme_req: [
      "English Language", 
      "Mathematics", 
      "Economics", 
      ["Commerce", "Government", "Geography"]
    ],
    waec_req: [
      "Mathematics", 
      "English Language", 
      "Economics", 
      "Government", 
      ["Commerce", "Geography", "Financial Accounting"]
    ],
    waec_sitting: "One Sitting",
    salary: "High", demand: "Medium"
  },
  "Employment Relations & HRM (IRPM)": {
    faculty: "Management Sciences", cutoff: 69.10, min_jamb: 210,
    utme_req: [
      "English Language", 
      "Mathematics", 
      "Economics", 
      ["Government", "Commerce"]
    ],
    waec_req: [
      "Mathematics", 
      "English Language", 
      "Economics", 
      "Government", 
      ["Commerce", "Geography", "History"]
    ],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "High"
  },

  // === SOCIAL SCIENCES ===
  "Mass Communication": {
    faculty: "Communication & Media Studies", cutoff: 74.075, min_jamb: 240,
    utme_req: [
      "English Language", 
      "Literature-in-English", 
      ["Government", "History"], 
      ["CRS", "IRS", "Economics", "Civic Education"]
    ],
    waec_req: [
      "English Language", 
      "Mathematics", 
      "Literature-in-English", 
      "Government", 
      ["Economics", "History", "Civic Education"]
    ],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "High"
  },
  "Economics": {
    faculty: "Social Sciences", cutoff: 73.475, min_jamb: 240,
    utme_req: [
      "English Language", 
      "Mathematics", 
      "Economics", 
      ["Government", "History", "Geography", "Literature-in-English"]
    ],
    waec_req: [
      "Mathematics", 
      "English Language", 
      "Economics", 
      "Government", 
      ["Geography", "History", "Literature-in-English"]
    ],
    waec_sitting: "One Sitting",
    salary: "High", demand: "High"
  },
  "Political Science": {
    faculty: "Social Sciences", cutoff: 68.15, min_jamb: 220,
    utme_req: [
      "English Language", 
      "Government", 
      ["Economics", "History"], 
      ["Literature-in-English", "CRS", "IRS", "Geography"]
    ],
    waec_req: [
      "English Language", 
      "Mathematics", 
      "Government", 
      "History", 
      ["Economics", "Literature-in-English", "CRS", "IRS"]
    ],
    waec_sitting: "One Sitting",
    salary: "High", demand: "Medium"
  },
  "Psychology": {
    faculty: "Social Sciences", cutoff: 69.70, min_jamb: 220,
    utme_req: [
      "English Language", 
      "Biology", 
      ["Economics", "Government", "Civic Education"], 
      ["Literature-in-English", "CRS", "IRS"]
    ],
    waec_req: [
      "English Language", 
      "Mathematics", 
      "Biology", 
      ["Economics", "Government"], 
      ["Literature-in-English", "History", "CRS"]
    ],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "Medium"
  },
  "Sociology": {
    faculty: "Social Sciences", cutoff: 67.20, min_jamb: 210,
    utme_req: [
      "English Language", 
      "Government", 
      ["Economics", "History"], 
      ["Literature-in-English", "Geography", "CRS"]
    ],
    waec_req: [
      "English Language", 
      "Mathematics", 
      "Government", 
      ["Economics", "History"], 
      ["Literature-in-English", "Geography", "CRS"]
    ],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "Medium"
  },
  "Geography": {
    faculty: "Social Sciences", cutoff: 62.50, min_jamb: 200,
    utme_req: [
      "English Language", 
      "Geography", 
      "Mathematics", 
      ["Economics", "Government"]
    ],
    waec_req: [
      "English Language", 
      "Mathematics", 
      "Geography", 
      "Economics", 
      ["Biology", "Government", "Physics"]
    ],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "Low"
  },
  "Social Work": {
    faculty: "Social Sciences", cutoff: 66.80, min_jamb: 200,
    utme_req: [
      "English Language", 
      "Government", 
      ["Economics", "Civic Education"], 
      ["Literature-in-English", "CRS", "History"]
    ],
    waec_req: [
      "English Language", 
      "Mathematics", 
      "Government", 
      ["Economics", "Civic Education"], 
      ["Biology", "Literature-in-English", "History"]
    ],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "High"
  },

  // === LAW & ARTS ===
  "Law": {
    faculty: "Law", cutoff: 78.225, min_jamb: 260,
    utme_req: [
      "English Language", 
      "Literature-in-English", 
      ["Government", "History"], 
      ["CRS", "IRS", "Economics"]
    ],
    waec_req: [
      "English Language", 
      "Mathematics", 
      "Literature-in-English", 
      "Government", 
      ["CRS", "IRS", "History", "Economics"]
    ],
    waec_sitting: "One Sitting",
    salary: "Very High", demand: "High"
  },
  "Creative Arts (Theatre/Visual/Music)": {
    faculty: "Arts", cutoff: 66.50, min_jamb: 200,
    utme_req: [
      "English Language", 
      "Fine Art",
      "Literature-in-English", 
      ["Government", "History", "CRS"]
    ],
    waec_req: [
      "English Language", 
      "Mathematics", 
      "Fine Art",
      "Literature-in-English", 
      ["Government", "History", "CRS"]
    ],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "Medium"
  },
  "English": {
    faculty: "Arts", cutoff: 67.00, min_jamb: 210,
    utme_req: [
      "English Language", 
      "Literature-in-English", 
      "Government", 
      ["CRS", "IRS", "History", "French"]
    ],
    waec_req: [
      "English Language", 
      "Mathematics", 
      "Literature-in-English", 
      "Government", 
      ["CRS", "IRS", "History", "French"]
    ],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "Medium"
  },
  "History & Strategic Studies": {
    faculty: "Arts", cutoff: 65.00, min_jamb: 200,
    utme_req: [
      "English Language", 
      "History", 
      "Government", 
      ["Literature-in-English", "CRS", "IRS", "Geography"]
    ],
    waec_req: [
      "English Language", 
      "Mathematics", 
      "History", 
      "Government", 
      ["Literature-in-English", "CRS", "IRS", "Geography"]
    ],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "Low"
  },
  "Philosophy": {
    faculty: "Arts", cutoff: 63.50, min_jamb: 200,
    utme_req: [
      "English Language", 
      "Government", 
      ["Literature-in-English", "CRS", "IRS"],
      ["History", "Economics"]
    ],
    waec_req: [
      "English Language", 
      "Mathematics", 
      "Government", 
      ["Literature-in-English", "CRS", "IRS"],
      ["History", "Economics"]
    ],
    waec_sitting: "One Sitting",
    salary: "High", demand: "Low"
  },
  "Linguistics": {
    faculty: "Arts", cutoff: 64.00, min_jamb: 200,
    utme_req: [
      "English Language", 
      "Literature-in-English", 
      ["Yoruba", "Igbo", "Hausa"], 
      ["Government", "History", "CRS"]
    ],
    waec_req: [
      "English Language", 
      "Mathematics", 
      "Literature-in-English", 
      ["Yoruba", "Igbo", "Hausa"], 
      ["Government", "History", "CRS"]
    ],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "Low"
  },
  "French": {
    faculty: "Arts", cutoff: 62.00, min_jamb: 200,
    utme_req: [
      "English Language", 
      "French",
      "Literature-in-English", 
      ["Government", "History", "CRS"]
    ],
    waec_req: [
      "English Language", 
      "Mathematics", 
      "French", 
      "Literature-in-English", 
      ["Government", "History", "CRS"]
    ],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "Low"
  },
  "Chinese": {
    faculty: "Arts", cutoff: 60.50, min_jamb: 200,
    utme_req: [
      "English Language", 
      "Government", 
      ["Literature-in-English", "History"], 
      ["CRS", "IRS", "Civic Education"]
    ],
    waec_req: [
      "English Language", 
      "Mathematics", 
      "Literature-in-English", 
      "Government", 
      ["Economics", "History", "CRS"]
    ],
    waec_sitting: "One Sitting",
    salary: "High", demand: "Medium"
  },

  // === ENVIRONMENTAL SCIENCES ===
  "Architecture": {
    faculty: "Environmental Sciences", cutoff: 75.575, min_jamb: 240,
    utme_req: [
      "English Language", 
      "Mathematics", 
      "Physics", 
      ["Chemistry", "Geography", "Economics", "Biology", "Fine Art"]
    ],
    waec_req: [
      "Mathematics", 
      "English Language", 
      "Physics", 
      "Fine Art",
      ["Chemistry", "Geography", "Economics", "Biology"]
    ],
    waec_sitting: "One Sitting",
    salary: "High", demand: "High"
  },
  "Quantity Surveying": {
    faculty: "Environmental Sciences", cutoff: 68.50, min_jamb: 210,
    utme_req: [
      "English Language", 
      "Mathematics", 
      "Physics", 
      ["Geography", "Economics", "Chemistry"]
    ],
    waec_req: [
      "Mathematics", 
      "English Language", 
      "Physics", 
      ["Geography", "Economics"], 
      ["Chemistry", "Biology", "Technical Drawing"]
    ],
    waec_sitting: "One Sitting",
    salary: "High", demand: "Medium"
  },
  "Building": {
    faculty: "Environmental Sciences", cutoff: 65.00, min_jamb: 200,
    utme_req: [
      "English Language", 
      "Mathematics", 
      "Physics", 
      ["Chemistry", "Economics"]
    ],
    waec_req: [
      "Mathematics", 
      "English Language", 
      "Physics", 
      "Chemistry", 
      ["Economics", "Technical Drawing", "Biology"]
    ],
    waec_sitting: "One Sitting",
    salary: "High", demand: "High"
  },
  "Estate Management": {
    faculty: "Environmental Sciences", cutoff: 63.50, min_jamb: 200,
    utme_req: [
      "English Language", 
      "Mathematics", 
      "Economics", 
      ["Physics", "Chemistry", "Biology", "Geography", "Financial Accounting"]
    ],
    waec_req: [
      "Mathematics", 
      "English Language", 
      "Economics", 
      "Geography", 
      ["Biology", "Physics", "Chemistry", "Financial Accounting"]
    ],
    waec_sitting: "One Sitting",
    salary: "High", demand: "High"
  },
  "Urban & Regional Planning": {
    faculty: "Environmental Sciences", cutoff: 53.50, min_jamb: 200,
    utme_req: [
      "English Language", 
      "Mathematics", 
      "Geography", 
      ["Economics", "Physics", "Chemistry", "Biology"]
    ],
    waec_req: [
      "Mathematics", 
      "English Language", 
      "Geography", 
      "Economics", 
      ["Physics", "Chemistry", "Biology", "Technical Drawing"]
    ],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "Medium"
  },

  // === EDUCATION ===
  "Science Education (Bio/Chem/Phys/Math)": {
    faculty: "Education", cutoff: 60.00, min_jamb: 200,
    utme_req: [
      "English Language", 
      "Subject of Specialization", 
      "Mathematics", 
      ["Physics", "Chemistry", "Biology"]
    ],
    waec_req: [
      "English Language", 
      "Mathematics", 
      "Subject of Specialization", 
      ["Physics", "Chemistry", "Biology"],
      ["Further Mathematics", "Geography", "Economics"]
    ],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "High"
  },
  "Arts Education (Eng/Hist/Religions)": {
    faculty: "Education", cutoff: 60.00, min_jamb: 200,
    utme_req: [
      "English Language", 
      "Subject of Specialization", 
      "Literature-in-English", 
      ["Government", "History", "CRS"]
    ],
    waec_req: [
      "English Language", 
      "Mathematics", 
      "Subject of Specialization", 
      "Literature-in-English", 
      ["Government", "History", "CRS"]
    ],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "Medium"
  },
  "Educational Management": {
    faculty: "Education", cutoff: 58.50, min_jamb: 200,
    utme_req: [
      "English Language", 
      "Government", 
      "Economics", 
      ["Literature-in-English", "Commerce", "Mathematics"]
    ],
    waec_req: [
      "English Language", 
      "Mathematics", 
      "Government", 
      "Economics", 
      ["Commerce", "Literature-in-English", "Geography"]
    ],
    waec_sitting: "One Sitting",
    salary: "Medium", demand: "Medium"
  }
};

// Helper function to check if requirements are met (handles flexible options)
const checkRequirements = (requirements, userSubjects) => {
  let matchCount = 0;
  for (const req of requirements) {
    if (Array.isArray(req)) {
      // Flexible option: match any one from the array
      if (req.some(option => userSubjects.includes(option))) matchCount++;
    } else {
      // Fixed requirement: must match exactly
      if (userSubjects.includes(req)) matchCount++;
    }
  }
  return matchCount;
};

// Helper to flatten requirements for display (keeps structure for UI)
const flattenRequirements = (requirements) => {
  // Return requirements as-is to preserve flexible options structure
  return requirements;
};

const CourseAdvisor = () => {
  const { isDarkMode: isDark } = useDarkMode();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [alternatives, setAlternatives] = useState([]);

  // --- FORM STATE ---
  const [jambScore, setJambScore] = useState('');
  const [stateOrigin, setStateOrigin] = useState('');
  const [preferredCourse, setPreferredCourse] = useState('');
  const [utmeSubs, setUtmeSubs] = useState(["English Language"]);
  const [olevels, setOlevels] = useState({}); 

  const analyzeProfile = () => {
    const parsedJamb = parseInt(jambScore);
    
    // 1. Validation
    if (!preferredCourse) return toast.error("Please select a target course.");
    if (!jambScore || isNaN(parsedJamb) || parsedJamb > 400 || utmeSubs.length !== 4) {
      return toast.error("Please enter a valid UTME score and 4 subjects.");
    }

    setLoading(true);

    setTimeout(() => {
      const targetCourse = COURSE_DB[preferredCourse];
      let disqualifiers = [];
      
      // --- GATEKEEPER 1: Hard UTME Floor ---
      // General UNILAG min is 200
      const hardFloor = Math.max(200, targetCourse.min_jamb); 
      if (parsedJamb < hardFloor) {
        disqualifiers.push(`JAMB Score ${parsedJamb} is too low. Minimum required is ${hardFloor}.`);
      }

      // --- GATEKEEPER 2: Subject Combination ---
      const matchingSubjects = checkRequirements(targetCourse.utme_req, utmeSubs);
      if (matchingSubjects < 3) {
         disqualifiers.push("Your UTME Subject combination does not match the core requirements.");
      }

      // --- CALCULATION ---
      const utmeAggregate = parsedJamb / 8; // Max 50
      
      let oLevelPoints = 0;
      let missingCredits = [];
      
      // Check WAEC requirements (handle flexible options)
      targetCourse.waec_req.forEach(req => {
        if (Array.isArray(req)) {
          // Flexible requirement - check if any option has a grade
          const hasGrade = req.some(option => olevels[option] && GRADE_POINTS[olevels[option]] > 0);
          if (hasGrade) {
            // Find the first option with a grade and use it
            const gradedOption = req.find(option => olevels[option] && GRADE_POINTS[olevels[option]] > 0);
            oLevelPoints += GRADE_POINTS[olevels[gradedOption]];
          } else {
            missingCredits.push(req.join(' / '));
          }
        } else {
          // Fixed requirement
          const grade = olevels[req];
          if (grade && GRADE_POINTS[grade] > 0) {
            oLevelPoints += GRADE_POINTS[grade];
          } else {
            missingCredits.push(req);
          }
        }
      });

      if (missingCredits.length > 0) {
        disqualifiers.push(`Missing O-Level Credit: ${missingCredits.join(', ')}`);
      }

      const totalAggregate = utmeAggregate + oLevelPoints;
      const isCatchment = CATCHMENT_STATES.includes(stateOrigin);
      const safeScore = isCatchment ? targetCourse.cutoff + 1 : targetCourse.cutoff + 3;

      let status = "LOW";
      
      if (disqualifiers.length > 0) {
        status = "DISQUALIFIED";
      } else {
        if (totalAggregate >= safeScore) status = "SECURE";
        else if (totalAggregate >= targetCourse.cutoff) status = "RISKY";
        else status = "UNLIKELY";
      }

      const mainResult = {
        name: preferredCourse,
        ...targetCourse,
        aggregate: totalAggregate,
        safeScore,
        status,
        disqualifiers,
        isCatchment
      };

      // --- ALTERNATIVES ENGINE (SMART RECOMMENDATION) ---
      let suggested = [];
      if (status !== "SECURE") {
        suggested = Object.keys(COURSE_DB)
          .filter(key => key !== preferredCourse)
          .map(key => {
            const course = COURSE_DB[key];
            
            // A. UTME Check: Does this course accept my UTME combo?
            const matchingUtme = checkRequirements(course.utme_req, utmeSubs);
            if (matchingUtme < 3) return null; // Must match at least 3 subjects

            // B. JAMB Score Check
            if (parsedJamb < Math.max(200, course.min_jamb)) return null;

            // C. Estimate Aggregate (Assume Best O-Levels since we don't know them yet)
            // We assume the student has B2 average (36 points) for courses we don't have grades for.
            // This is a "Projection" to show potential.
            const projectedOLevel = 36; // Average decent student
            const projectedAgg = utmeAggregate + projectedOLevel;
            const altCutoff = isCatchment ? course.cutoff - 2 : course.cutoff;

            // Only recommend if they stand a chance
            if (projectedAgg >= altCutoff - 5) { // Within 5 points range
              return { 
                name: key, 
                ...course, 
                chance: projectedAgg >= altCutoff ? "High" : "Fair", 
                safeScore: altCutoff + 2 
              };
            }
            return null;
          })
          .filter(Boolean)
          .sort((a, b) => a.cutoff - b.cutoff) // Sort by easiest entry (lowest cutoff)
          .slice(0, 3);
      }

      setResults([mainResult]);
      setAlternatives(suggested);
      setLoading(false);
      setStep(2);
      
      if (status === "SECURE") confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

    }, 1500);
  };

  const SafetyGauge = ({ score, cutoff, safeScore }) => {
    const percentage = Math.min(100, Math.max(0, score));
    return (
      <div className="relative pt-4 select-none">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-2 text-slate-400">
          <span>Unlikely</span><span>Risky</span><span>Secure</span>
        </div>
        <div className="relative h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div className="h-full bg-red-400/30" style={{ width: `${cutoff}%` }} />
          <div className="h-full bg-yellow-400/30" style={{ width: `${safeScore - cutoff}%` }} />
          <div className="h-full bg-green-400/30" style={{ flex: 1 }} />
          <motion.div initial={{ left: 0 }} animate={{ left: `${percentage}%` }} className="absolute top-0 bottom-0 w-1 bg-black dark:bg-white z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)]"/>
        </div>
        <div className="mt-4 p-3 rounded-xl border text-sm font-medium flex items-start gap-3"
          style={{ borderColor: score >= safeScore ? '#10b981' : score >= cutoff ? '#f59e0b' : '#ef4444', color: score >= safeScore ? '#059669' : score >= cutoff ? '#d97706' : '#dc2626' }}>
          {score >= safeScore ? <CheckCircle2 className="w-5 h-5 shrink-0"/> : score >= cutoff ? <AlertTriangle className="w-5 h-5 shrink-0"/> : <XCircle className="w-5 h-5 shrink-0"/>}
          <span>{score >= safeScore ? `Great Job! Your ${score.toFixed(2)}% is safely above the threshold.` : score >= cutoff ? `You passed the cutoff (${cutoff}%), but it's competitive.` : `Your aggregate (${score.toFixed(2)}%) is below the required ${cutoff}%.`}</span>
        </div>
      </div>
    );
  };

  const renderInput = () => {
    const requiredOLevels = preferredCourse && COURSE_DB[preferredCourse] 
      ? flattenRequirements(COURSE_DB[preferredCourse].waec_req)
      : [];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Card className="rounded-[2rem] border-0 shadow-lg dark:bg-slate-900">
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="text-indigo-600" /> Profile Data</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Course</Label>
                  <select className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-transparent focus:border-indigo-500 outline-none" 
                    value={preferredCourse} onChange={e => {
                      setPreferredCourse(e.target.value);
                      setOlevels({}); 
                    }}>
                    <option value="">Select Course...</option>
                    {Object.keys(COURSE_DB).sort().map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>UTME Score</Label>
                  <input type="number" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-transparent focus:border-indigo-500 outline-none" 
                    placeholder="e.g. 250" value={jambScore} onChange={e => setJambScore(e.target.value)} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>State of Origin</Label>
                <select className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-transparent focus:border-indigo-500 outline-none" 
                  value={stateOrigin} onChange={e => setStateOrigin(e.target.value)}>
                  <option value="">Select State</option>
                  {ALL_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>UTME Subjects (Select 4 you wrote)</Label>
                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed">
                  {SUBJECTS_LIST.map(sub => (
                    <button key={sub} onClick={() => {
                      if(utmeSubs.includes(sub) && sub !== "English Language") setUtmeSubs(p => p.filter(s => s !== sub));
                      else if(!utmeSubs.includes(sub) && utmeSubs.length < 4) setUtmeSubs(p => [...p, sub]);
                    }} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${utmeSubs.includes(sub) ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-500'} ${sub === "English Language" ? 'opacity-60 cursor-not-allowed' : ''}`}>
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <Label>Required O-Level Subjects</Label>
                  {preferredCourse ? <Badge className="bg-green-100 text-green-700">For {preferredCourse}</Badge> : <Badge variant="outline">Select course first</Badge>}
                </div>
                
                {preferredCourse ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {requiredOLevels.map((sub, idx) => {
                      const isFlexible = Array.isArray(sub);
                      const displayLabel = isFlexible ? sub.join(' / ') : sub;
                      const subjectKey = isFlexible ? sub[0] : sub;
                      
                      return (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                          <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 truncate mb-1" title={displayLabel}>{displayLabel}</p>
                          <select 
                            value={olevels[subjectKey] || ""} 
                            onChange={e => {
                              const newOlevels = {...olevels};
                              if (isFlexible) {
                                // Clear all flexible options first
                                sub.forEach(s => delete newOlevels[s]);
                              }
                              newOlevels[subjectKey] = e.target.value;
                              setOlevels(newOlevels);
                            }} 
                            className="w-full bg-transparent font-bold text-sm outline-none cursor-pointer">
                            <option value="">Grade</option>
                            {Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center p-8 border-2 border-dashed rounded-xl text-slate-400 text-sm">
                    Select a target course above to see required O-Level subjects.
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-4">
          <Card className="rounded-[2rem] border-0 shadow-xl bg-slate-900 text-white h-full relative overflow-hidden flex flex-col justify-center text-center p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/50 to-purple-900/50" />
            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur-md"><Brain className="w-8 h-8 text-indigo-300" /></div>
              <div><h2 className="text-2xl font-bold">Admissions AI</h2><p className="text-indigo-200 text-sm">Strict validation against 2025 Cutoffs.</p></div>
              <Button onClick={analyzeProfile} disabled={loading} className="w-full h-12 bg-white text-indigo-900 font-bold hover:bg-indigo-50">{loading ? "Analyzing..." : "Check Probability"}</Button>
            </div>
          </Card>
        </div>
      </motion.div>
    );
  };

  const renderResults = () => {
    const main = results[0];
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Consultant Report</h2>
          <Button variant="outline" onClick={() => setStep(1)}><RefreshCw className="w-4 h-4 mr-2"/> New Analysis</Button>
        </div>

        <Card className="rounded-[2rem] border-0 shadow-xl overflow-hidden">
          <div className={`h-3 w-full ${main.status === "SECURE" ? "bg-green-500" : main.status === "RISKY" ? "bg-yellow-500" : "bg-red-500"}`} />
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="text-sm px-3 py-1">{main.faculty}</Badge>
                    {main.isCatchment && <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><MapPin className="w-3 h-3 mr-1"/> Catchment</Badge>}
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{main.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase">Your Aggregate</p>
                    <p className="text-3xl font-bold text-indigo-600">{main.aggregate.toFixed(2)}%</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase">Required Safe Score</p>
                    <p className="text-3xl font-bold text-slate-700 dark:text-white">{main.safeScore.toFixed(2)}%</p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-center mb-4">Admission Probability</h4>
                {main.status === "DISQUALIFIED" ? (
                  <div className="text-center text-red-600">
                    <XCircle className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p className="font-bold">Not Eligible</p>
                    <ul className="text-xs text-left mt-2 list-disc list-inside">
                        {main.disqualifiers.map((d,i)=><li key={i}>{d}</li>)}
                    </ul>
                  </div>
                ) : (
                  <SafetyGauge score={main.aggregate} cutoff={main.cutoff} safeScore={main.safeScore} />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {alternatives.length > 0 && (
          <div className="animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recommended Safety Options</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {alternatives.map((alt, idx) => (
                <Card key={idx} className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white dark:bg-slate-900 group">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600"><Award className="w-5 h-5" /></div>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Safe Bet</Badge>
                    </div>
                    <h4 className="font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors">{alt.name}</h4>
                    <div className="space-y-2 text-sm text-slate-500">
                      <div className="flex justify-between"><span>Safe Score:</span> <strong>{alt.safeScore.toFixed(2)}%</strong></div>
                      <p className="text-xs text-slate-400 mt-2 italic">*Based on your UTME score & subjects.</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} p-4 md:p-8`}>
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/20"><Compass className="h-6 w-6 text-white" /></div><div><h1 className="text-2xl font-bold">Pathfinder</h1><p className="text-xs text-slate-500 font-medium">Intelligent Admission Consultant</p></div></div>
      </div>
      <div className="max-w-7xl mx-auto"><AnimatePresence mode="wait">{step === 1 ? renderInput() : renderResults()}</AnimatePresence></div>
    </div>
  );
};

export default CourseAdvisor;