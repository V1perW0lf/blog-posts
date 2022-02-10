const index = require("./index.js")
const supertest = require("supertest")

describe('Test the routes', function() {

    test('Ping is successful', async () => {
        await supertest(index).get("/api/ping").expect(200).then(res => {
            expect(res.body).toStrictEqual({"success" : true})
        })
    })

    test('Tags parameter is provided', async () => {
        await supertest(index).get("/api/posts").expect(400).then(res => {
            expect(res.body).toStrictEqual({"error": "Tags parameter is required"})
        })
    })

    test('Tags parameter is provided and not blank', async () => {
        await supertest(index).get("/api/posts").query({'tags': ''}).expect(400).then(res => {
            expect(res.body).toStrictEqual({"error": "Tags parameter is required"})
        })
    })

    test('sortBy parameter is valid', async () => {
        await supertest(index).get("/api/posts").query({'tags': 'science,tech'}).query({'sortBy': 'invalid_option'}).expect(400).then(res => {
            expect(res.body).toStrictEqual({"error": "sortBy parameter is invalid"})
        })
    })

    test('Direction parameter is valid', async () => {
        await supertest(index).get("/api/posts").query({'tags': 'science,tech'}).query({'direction': 'invalid_option'}).expect(400).then(res => {
            expect(res.body).toStrictEqual({"error": "direction parameter is invalid"})
        })
    })

    test('Results are sorted by id by default ascending', async () => {
        await supertest(index).get("/api/posts").query({'tags' : 'science,tech'}).expect(200).then(res => {
            posts = res.body.posts
            last_id = -1
            sorted = true
            for (const post in posts) {
                if(last_id > posts[post].id) {
                    sorted = false
                }
                last_id = posts[post].id
            }
            expect(sorted).toStrictEqual(true)
            expect(last_id).toStrictEqual(100)
        })
    })

    test('Results can be sorted by reads descending', async () => {
        await supertest(index).get("/api/posts").query({'tags' : 'science,tech'}).query({'sortBy': 'reads'}).query({'direction': 'desc'}).expect(200).then(res => {
            posts = res.body.posts
            last_reads = posts[0].reads
            sorted = true
            for (const post in posts) {
                if(last_reads < posts[post].reads) {
                    sorted = false
                }
                last_reads = posts[post].reads
            }
            expect(sorted).toStrictEqual(true)
            expect(last_reads).toStrictEqual(312)
        })
    })

    test('No duplicates are returned', async () => {
        await supertest(index).get("/api/posts").query({'tags' : 'science,tech'}).expect(200).then(res => {
            expect((new Set(res.body.posts)).size !== res.body.posts.length).toStrictEqual(false)
        })
    })

})