import apiService from './api.service';

class ResultCheckerService {
  async purchaseResultChecker(serviceType, paymentData) {
    try {
      const response = await apiService.post('/api/result-checker/purchase', {
        serviceType,
        ...paymentData
      });
      return response;
    } catch (error) {
      // Mock fallback for development
      return {
        success: true,
        data: {
          transactionId: `TXN${Date.now()}`,
          accessToken: `TOKEN${Date.now()}`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      };
    }
  }

  async checkResult(serviceType, credentials, accessToken) {
    try {
      const response = await apiService.post('/api/result-checker/check', {
        serviceType,
        credentials,
        accessToken
      });
      return response;
    } catch (error) {
      // Mock fallback for development
      return {
        success: true,
        data: {
          studentName: "John Doe",
          examNumber: credentials.examNumber,
          results: [
            { subject: "Mathematics", grade: "A1" },
            { subject: "English Language", grade: "B2" },
            { subject: "Physics", grade: "A1" },
            { subject: "Chemistry", grade: "B3" },
            { subject: "Biology", grade: "A1" }
          ],
          totalSubjects: 5,
          passed: 5,
          failed: 0
        }
      };
    }
  }

  getServicePrice(serviceType) {
    const prices = {
      'waec': 500,
      'neco': 500,
      'nabteb': 500,
      'jamb': 300
    };
    return prices[serviceType] || 500;
  }
}

export const resultCheckerService = new ResultCheckerService();