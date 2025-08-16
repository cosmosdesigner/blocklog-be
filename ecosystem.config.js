module.exports = {
  apps: [{
    name: 'blocklog-be',
    script: 'dist/main.js',
    cwd: '/var/www/blocklog-be',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/blocklog-be-error.log',
    out_file: '/var/log/pm2/blocklog-be-out.log',
    log_file: '/var/log/pm2/blocklog-be.log',
    time: true
  }]
};
