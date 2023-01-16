const { syncDB } = require("../../src/tasks/sync-db")


describe('Pruebas en syncDB', () => {
    test('Debe ejecutar el proceso 2 veces', () => {
        syncDB()
        const times = syncDB()
        expect(times).toBe(2)
    })
})