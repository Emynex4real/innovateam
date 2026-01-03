/**
 * Metrics Utility (StatsD/Datadog compatible)
 * Tracks performance, errors, and business metrics
 */

const StatsD = require('hot-shots');

const client = new StatsD({
  host: process.env.STATSD_HOST || 'localhost',
  port: process.env.STATSD_PORT || 8125,
  prefix: 'innovateam.',
  globalTags: { env: process.env.NODE_ENV || 'development' },
  mock: process.env.NODE_ENV === 'test' // Mock in tests
});

const metrics = {
  /**
   * Increment a counter
   */
  increment(metric, value = 1, tags = {}) {
    client.increment(metric, value, tags);
  },

  /**
   * Record a timing (in milliseconds)
   */
  timing(metric, value, tags = {}) {
    client.timing(metric, value, tags);
  },

  /**
   * Record a gauge (current value)
   */
  gauge(metric, value, tags = {}) {
    client.gauge(metric, value, tags);
  },

  /**
   * Record a histogram
   */
  histogram(metric, value, tags = {}) {
    client.histogram(metric, value, tags);
  },

  /**
   * Close the client
   */
  close() {
    client.close();
  }
};

module.exports = metrics;
