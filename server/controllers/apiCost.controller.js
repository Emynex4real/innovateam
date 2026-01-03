const supabase = require('../supabaseClient');

/**
 * 📊 API COST MONITORING CONTROLLER
 * Provides endpoints for tracking and analyzing AI API costs
 */
class APICostController {

  /**
   * 📈 GET DAILY COST ANALYSIS
   * Returns daily breakdown of API usage and costs
   */
  async getDailyCostAnalysis(req, res) {
    try {
      const { startDate, endDate, service = 'gemini' } = req.query;

      let query = supabase
        .from('api_cost_analysis')
        .select('*')
        .eq('service', service)
        .order('date', { ascending: false })
        .limit(30);

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      const totalCost = data.reduce((sum, row) => sum + parseFloat(row.estimated_cost_usd || 0), 0);
      const totalRequests = data.reduce((sum, row) => sum + parseInt(row.total_requests || 0), 0);
      const successRate = data.reduce((sum, row) => {
        const rate = row.successful_requests / row.total_requests;
        return sum + (isNaN(rate) ? 0 : rate);
      }, 0) / (data.length || 1);

      res.json({
        success: true,
        data: {
          dailyBreakdown: data,
          summary: {
            totalCost: totalCost.toFixed(4),
            totalRequests,
            successRate: (successRate * 100).toFixed(2) + '%',
            period: data.length + ' days'
          }
        }
      });

    } catch (error) {
      console.error('❌ Get daily cost analysis error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 👥 GET USER COST SUMMARY
   * Returns per-user cost breakdown
   */
  async getUserCostSummary(req, res) {
    try {
      const { limit = 50, minCost = 0 } = req.query;

      const { data, error } = await supabase
        .from('user_api_costs')
        .select('*')
        .gte('estimated_cost_usd', minCost)
        .order('estimated_cost_usd', { ascending: false })
        .limit(parseInt(limit));

      if (error) throw error;

      res.json({
        success: true,
        data: {
          users: data,
          count: data.length
        }
      });

    } catch (error) {
      console.error('❌ Get user cost summary error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * 📊 GET USAGE STATS
   * Returns real-time usage statistics
   */
  async getUsageStats(req, res) {
    try {
      const { period = '24h' } = req.query;

      let timeFilter;
      switch (period) {
        case '1h':
          timeFilter = new Date(Date.now() - 60 * 60 * 1000).toISOString();
          break;
        case '24h':
          timeFilter = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          break;
        case '7d':
          timeFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case '30d':
          timeFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        default:
          timeFilter = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      }

      const { data, error } = await supabase
        .from('api_usage_logs')
        .select('*')
        .eq('service', 'gemini')
        .gte('created_at', timeFilter);

      if (error) throw error;

      const stats = {
        totalRequests: data.length,
        successfulRequests: data.filter(r => r.status === 'success').length,
        failedRequests: data.filter(r => r.status === 'failed').length,
        totalInputTokens: data.reduce((sum, r) => sum + (r.input_tokens || 0), 0),
        totalOutputTokens: data.reduce((sum, r) => sum + (r.output_tokens || 0), 0),
        uniqueUsers: new Set(data.map(r => r.user_id).filter(Boolean)).size,
        operationBreakdown: {}
      };

      data.forEach(record => {
        if (!stats.operationBreakdown[record.operation]) {
          stats.operationBreakdown[record.operation] = 0;
        }
        stats.operationBreakdown[record.operation]++;
      });

      const estimatedCost = (stats.totalInputTokens * 0.075 / 1000000) + 
                           (stats.totalOutputTokens * 0.30 / 1000000);

      stats.estimatedCost = estimatedCost.toFixed(4);
      stats.successRate = ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2) + '%';

      res.json({
        success: true,
        data: {
          period,
          stats
        }
      });

    } catch (error) {
      console.error('❌ Get usage stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new APICostController();
