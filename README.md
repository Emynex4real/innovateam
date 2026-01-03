# JAMB Course Advisor & Question Generator

A React-based application that helps JAMB university aspirants get course recommendations based on their qualifications and generate practice questions from text documents.

## Features

- Course Recommendation System
  - Input WAEC grades for key subjects
  - Enter JAMB score
  - Specify interests and career goals
  - Get personalized course recommendations

- Question Generator
  - Upload text documents (TXT format)
  - Generate true/false questions
  - Practice with generated questions
  - **Fuzzy matching**: Type subject/topic names in any format (e.g., "Lit" = "Literature in English", "Math" = "Mathematics")
  - **Typo tolerance**: Minor spelling mistakes are automatically corrected
  - **269 JAMB syllabus topics** across 14 subjects

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- DeepSeek API key (free tier)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install dependencies:
   ```bash
   npm install
   cd server && npm install
   ```

3. Configure environment variables:
   ```bash
   # Frontend
   cp .env.example .env.local
   # Edit .env.local with your credentials

   # Backend
   cp server/.env.example server/.env
   # Edit server/.env with your credentials
   ```

4. Generate secrets:
   ```bash
   node scripts/generate-secrets.js
   ```

5. Start the application:
   ```bash
   # Backend (terminal 1)
   cd server && npm start

   # Frontend (terminal 2)
   npm start
   ```

6. Access: http://localhost:3000

## Testing the Application

1. Course Advisor:
   - Fill in WAEC grades (e.g., A1 in English, B3 in Math)
   - Enter JAMB score (e.g., 270)
   - Describe your interests
   - Click "Get Course Recommendations"

2. Question Generator:
   - Create a sample TXT file with educational content
   - Upload the file
   - Click "Generate Questions"
   - Review the generated true/false questions

## Deployment

1. Frontend (Vercel):
   - Connect your GitHub repository to Vercel
   - Set the build command: `cd client && npm install && npm run build`
   - Set the output directory: `client/build`

2. Backend (Render):
   - Create a new Web Service on Render
   - Connect your GitHub repository
   - Set the build command: `cd server && npm install`
   - Set the start command: `cd server && npm start`
   - Add environment variables (DEEPSEEK_API_KEY)

## API Rate Limits

- DeepSeek API free tier: 1 million tokens/month
- Rate limit: 10 requests/minute
- The application includes built-in rate limiting and debouncing

## Future Backend Integration

The current backend is designed to be modular and easily integrated into a future, more comprehensive backend:

1. The endpoints (`/recommend` and `/generate-questions`) can be moved to a new backend
2. Update the frontend API configuration in `src/utils/api.js`
3. Ensure the new backend implements the same request/response format
4. Add any additional authentication or security measures needed

## Security

**CRITICAL**: Never commit credentials to version control.

- Use `.env.local` for local development
- Use platform environment variables for production
- Rotate credentials every 90 days
- See [SECURITY_PRACTICES.md](SECURITY_PRACTICES.md) for details

## Notes

- Keep your DeepSeek API key secure and never commit it to version control
- Monitor your API usage to stay within the free tier limits
- Consider implementing caching for frequently requested course recommendations
- Regular backups of any stored data are recommended

## Support

For issues or questions:
1. Check the GitHub Issues page
2. Create a new issue with detailed information
3. Include any error messages and steps to reproduce

## License

This project is licensed under the MIT License - see the LICENSE file for details.
