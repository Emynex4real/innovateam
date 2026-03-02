module.exports = {
  apps: [{
    name: 'innovateam-backend',
    script: './server.js',
    cwd: '/var/www/innovateam/server',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/innovateam-error.log',
    out_file: '/var/log/pm2/innovateam-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
