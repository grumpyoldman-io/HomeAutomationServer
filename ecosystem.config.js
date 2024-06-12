module.exports = {
  apps: [
    {
      name: 'HomeAutomationServer',
      script: './dist/src/main.js',
      env: {
        NODE_ENV: 'production',
      },
      watch: ['dist', 'ecosystem.config.js', 'package.json'],
      watch_delay: 5000,
    },
  ],
};
