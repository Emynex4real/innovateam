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
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Configure environment variables:
   - Create a `server/.env` file:
     ```
     DEEPSEEK_API_KEY=your_deepseek_api_key
     PORT=5000
     ```
   - Get your DeepSeek API key from [deepseek.com](https://deepseek.com)

4. Start the application:
   ```bash
   # Start the backend server (from server directory)
   npm start

   # Start the frontend development server (from client directory)
   npm start
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

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
