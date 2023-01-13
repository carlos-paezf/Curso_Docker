const cron = require('node-cron')

cron.schedule('1-59/5 * * * * *', () => {
    console.count('running a task')
})