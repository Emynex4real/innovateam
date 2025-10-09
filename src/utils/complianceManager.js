// Compliance & Privacy Manager
import { secureLogger } from './secureLogger';
import { supabase } from '../services/supabase/client';

class ComplianceManager {
  constructor() {
    this.dataRetentionPeriods = {
      user_data: 365 * 7, // 7 years
      transaction_logs: 365 * 5, // 5 years
      activity_logs: 365 * 2, // 2 years
      session_data: 30 // 30 days
    };
    this.consentTypes = ['data_processing', 'marketing', 'analytics', 'cookies'];
  }

  // GDPR/NDPR Compliance - Data Subject Rights
  async handleDataSubjectRequest(userId, requestType, details = {}) {
    const supportedRequests = ['access', 'rectification', 'erasure', 'portability', 'restriction'];
    
    if (!supportedRequests.includes(requestType)) {
      throw new Error(`Unsupported data subject request: ${requestType}`);
    }

    // Log the request for audit trail
    await secureLogger.logSecurityEvent('data_subject_request', {
      userId,
      requestType,
      details,
      timestamp: new Date().toISOString()
    });

    switch (requestType) {
      case 'access':
        return await this.exportUserData(userId);
      case 'erasure':
        return await this.deleteUserData(userId);
      case 'portability':
        return await this.exportUserDataPortable(userId);
      default:
        return { status: 'pending', message: 'Request logged for manual processing' };
    }
  }

  // Export user data (Right to Access)
  async exportUserData(userId) {
    try {
      const userData = {};

      // Get user profile
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (user) {
        userData.profile = {
          email: user.email,
          created_at: user.created_at,
          last_login: user.last_login,
          is_verified: user.is_verified
        };
      }

      // Get transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      userData.transactions = transactions || [];

      // Get activity logs (last 90 days only)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: activities } = await supabase
        .from('activity_logs')
        .select('action, resource, created_at')
        .eq('user_id', userId)
        .gte('created_at', ninetyDaysAgo.toISOString());

      userData.recent_activities = activities || [];

      return {
        status: 'completed',
        data: userData,
        exported_at: new Date().toISOString()
      };
    } catch (error) {
      await secureLogger.logError(error, { type: 'data_export_failed', userId });
      throw error;
    }
  }

  // Delete user data (Right to Erasure)
  async deleteUserData(userId) {
    try {
      // Check if user has active transactions or legal obligations
      const { data: activeTransactions } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      if (activeTransactions && activeTransactions.length > 0) {
        return {
          status: 'rejected',
          reason: 'Cannot delete data due to active transactions and legal retention requirements'
        };
      }

      // Anonymize instead of delete for audit trail
      await supabase
        .from('users')
        .update({
          email: `deleted_${userId}@anonymized.local`,
          phone: null,
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', userId);

      // Keep transaction records but anonymize
      await supabase
        .from('transactions')
        .update({
          description: 'ANONYMIZED'
        })
        .eq('user_id', userId);

      return {
        status: 'completed',
        message: 'User data has been anonymized while preserving legal compliance'
      };
    } catch (error) {
      await secureLogger.logError(error, { type: 'data_deletion_failed', userId });
      throw error;
    }
  }

  // Consent management
  async recordConsent(userId, consentType, granted, purpose) {
    if (!this.consentTypes.includes(consentType)) {
      throw new Error(`Invalid consent type: ${consentType}`);
    }

    try {
      await supabase.from('user_consents').insert({
        user_id: userId,
        consent_type: consentType,
        granted,
        purpose,
        recorded_at: new Date().toISOString(),
        ip_address: this.getClientIP(),
        user_agent: navigator.userAgent
      });

      await secureLogger.logEvent('consent_recorded', {
        userId,
        consentType,
        granted,
        purpose
      });

      return { success: true };
    } catch (error) {
      await secureLogger.logError(error, { type: 'consent_recording_failed' });
      throw error;
    }
  }

  // Data retention policy enforcement
  async enforceDataRetention() {
    const results = {
      processed: 0,
      errors: []
    };

    for (const [dataType, retentionDays] of Object.entries(this.dataRetentionPeriods)) {
      try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        let deleteCount = 0;

        switch (dataType) {
          case 'activity_logs':
            const { count } = await supabase
              .from('activity_logs')
              .delete()
              .lt('created_at', cutoffDate.toISOString());
            deleteCount = count || 0;
            break;

          case 'session_data':
            // Clear old session storage items
            if (typeof window !== 'undefined') {
              const keys = Object.keys(sessionStorage);
              keys.forEach(key => {
                if (key.startsWith('sec_')) {
                  const item = sessionStorage.getItem(key);
                  try {
                    const data = JSON.parse(item);
                    if (data.timestamp && new Date(data.timestamp) < cutoffDate) {
                      sessionStorage.removeItem(key);
                      deleteCount++;
                    }
                  } catch (e) {
                    // Invalid format, remove it
                    sessionStorage.removeItem(key);
                    deleteCount++;
                  }
                }
              });
            }
            break;
        }

        results.processed += deleteCount;
        
        await secureLogger.logEvent('data_retention_enforced', {
          dataType,
          deletedCount: deleteCount,
          cutoffDate: cutoffDate.toISOString()
        });

      } catch (error) {
        results.errors.push({ dataType, error: error.message });
        await secureLogger.logError(error, { type: 'data_retention_failed', dataType });
      }
    }

    return results;
  }

  // Privacy policy compliance check
  validatePrivacyCompliance(userData) {
    const compliance = {
      isCompliant: true,
      issues: []
    };

    // Check for required consents
    const requiredConsents = ['data_processing'];
    requiredConsents.forEach(consent => {
      if (!userData.consents || !userData.consents[consent]) {
        compliance.isCompliant = false;
        compliance.issues.push(`Missing required consent: ${consent}`);
      }
    });

    // Check data minimization
    const allowedFields = ['email', 'phone', 'created_at', 'last_login'];
    if (userData.profile) {
      Object.keys(userData.profile).forEach(field => {
        if (!allowedFields.includes(field) && field !== 'id') {
          compliance.issues.push(`Unnecessary data field collected: ${field}`);
        }
      });
    }

    return compliance;
  }

  // Get client IP (mock implementation)
  getClientIP() {
    // In a real implementation, this would get the actual client IP
    return '0.0.0.0';
  }

  // Generate privacy report
  async generatePrivacyReport(userId) {
    const report = {
      user_id: userId,
      generated_at: new Date().toISOString(),
      data_categories: {},
      consents: {},
      retention_status: {},
      compliance_score: 0
    };

    try {
      // Get data categories
      const userData = await this.exportUserData(userId);
      report.data_categories = {
        profile_data: !!userData.data.profile,
        transaction_data: userData.data.transactions.length,
        activity_data: userData.data.recent_activities.length
      };

      // Calculate compliance score
      const compliance = this.validatePrivacyCompliance(userData.data);
      report.compliance_score = compliance.isCompliant ? 100 : 
        Math.max(0, 100 - (compliance.issues.length * 20));

      return report;
    } catch (error) {
      await secureLogger.logError(error, { type: 'privacy_report_failed', userId });
      throw error;
    }
  }
}

export const complianceManager = new ComplianceManager();