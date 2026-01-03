const supabase = require('../supabaseClient');
const logger = require('../utils/logger');

class TestSchedulerService {
  /**
   * Activate tests that should start now
   */
  async activateScheduledTests() {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('tc_question_sets')
        .update({ 
          is_active: true,
          last_activated_at: now
        })
        .eq('auto_activate', true)
        .eq('is_active', false)
        .lte('scheduled_start', now)
        .or(`scheduled_end.is.null,scheduled_end.gt.${now}`)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        logger.info(`Activated ${data.length} scheduled tests`);
      }

      return { success: true, activated: data?.length || 0 };
    } catch (error) {
      logger.error('Failed to activate scheduled tests:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Deactivate tests that should end now
   */
  async deactivateScheduledTests() {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('tc_question_sets')
        .update({ is_active: false })
        .eq('auto_deactivate', true)
        .eq('is_active', true)
        .lte('scheduled_end', now)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        logger.info(`Deactivated ${data.length} scheduled tests`);
      }

      return { success: true, deactivated: data?.length || 0 };
    } catch (error) {
      logger.error('Failed to deactivate scheduled tests:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle recurring test activations
   */
  async handleRecurringTests() {
    try {
      const now = new Date();
      
      // Get recurring tests that need activation
      const { data: tests, error } = await supabase
        .from('tc_question_sets')
        .select('*')
        .eq('is_recurring', true)
        .eq('is_active', false)
        .not('recurrence_pattern', 'is', null);

      if (error) throw error;

      let activated = 0;

      for (const test of tests || []) {
        const shouldActivate = this.shouldActivateRecurring(test, now);
        
        if (shouldActivate) {
          const nextActivation = this.calculateNextActivation(test, now);
          
          await supabase
            .from('tc_question_sets')
            .update({
              is_active: true,
              last_activated_at: now.toISOString(),
              next_activation_at: nextActivation
            })
            .eq('id', test.id);
          
          activated++;
        }
      }

      if (activated > 0) {
        logger.info(`Activated ${activated} recurring tests`);
      }

      return { success: true, activated };
    } catch (error) {
      logger.error('Failed to handle recurring tests:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if recurring test should activate now
   */
  shouldActivateRecurring(test, now) {
    if (!test.next_activation_at) {
      return true; // First activation
    }

    const nextActivation = new Date(test.next_activation_at);
    return now >= nextActivation;
  }

  /**
   * Calculate next activation time for recurring test
   */
  calculateNextActivation(test, currentTime) {
    const { recurrence_pattern, recurrence_days } = test;
    const next = new Date(currentTime);

    switch (recurrence_pattern) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;

      case 'weekly':
        if (recurrence_days && recurrence_days.length > 0) {
          const currentDay = next.getDay();
          const days = recurrence_days.sort((a, b) => a - b);
          
          // Find next day in array
          let nextDay = days.find(d => d > currentDay);
          
          if (!nextDay) {
            // Wrap to next week
            nextDay = days[0];
            next.setDate(next.getDate() + (7 - currentDay + nextDay));
          } else {
            next.setDate(next.getDate() + (nextDay - currentDay));
          }
        } else {
          next.setDate(next.getDate() + 7);
        }
        break;

      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;

      default:
        return null;
    }

    return next.toISOString();
  }

  /**
   * Run all scheduler tasks
   */
  async runScheduler() {
    logger.info('Running test scheduler...');
    
    const results = await Promise.all([
      this.activateScheduledTests(),
      this.deactivateScheduledTests(),
      this.handleRecurringTests()
    ]);

    const summary = {
      activated: results[0].activated + results[2].activated,
      deactivated: results[1].deactivated,
      timestamp: new Date().toISOString()
    };

    logger.info('Scheduler completed:', summary);
    return summary;
  }
}

module.exports = new TestSchedulerService();
