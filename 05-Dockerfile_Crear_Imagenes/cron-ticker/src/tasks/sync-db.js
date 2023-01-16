let ticks = 0


const syncDB = () => {
    console.count('running a task')
    ticks++
    return ticks
}


module.exports = { syncDB }