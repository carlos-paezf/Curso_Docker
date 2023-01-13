const cron = require('node-cron')

cron.schedule('1-59/3 * * * * *', () => {
    console.count('running a task')
})