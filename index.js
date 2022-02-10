const express = require("express");
const https = require ('https')

const app = express();

app.get("/api/ping", (req, res) => {
    res.status(200).send({"success" : true});
})

app.get("/api/posts", (req, res) => {

    let sort_by = ''
    let direction = ''

    if(req.query.sortBy == undefined) {
        sort_by = "id";
    } else {
        sort_by = req.query.sortBy;
    }

    if(req.query.direction == undefined) {
        direction = "asc";
    } else {
        direction = req.query.direction;
    }

    allowed_sorts = ["id", "reads", "likes", "popularity"]
    allowed_directions = ["desc", "asc"]

    if(req.query.tags == undefined || req.query.tags == "") {
        res.status(400).send({"error": "Tags parameter is required"})
    } else if(!allowed_sorts.includes(sort_by)) {
        res.status(400).send({"error": "sortBy parameter is invalid"})
    } else if(!allowed_directions.includes(direction)) {
        res.status(400).send({"error": "direction parameter is invalid"})
    } else {
        tags = (req.query.tags).split(",")

        final_data = []
        // Used for quick comparison so we don't have duplicates
        ids = []

        function request (url, tags) {
            https.get(url + tags[tags.length - 1], (re) => {
                let data = '';
                re.on('data', (chunk) => {
                    data += chunk;
                });
                re.on('end', () => {
                    tags.pop()
                    const posts = JSON.parse(data).posts
                    for(const post in posts) {
                        if(!ids.includes(posts[post].id)) {
                            ids.push(posts[post].id)
                            final_data.push(posts[post])
                        }
                    }
                    if(tags.length > 0) {
                        request(url, tags)
                    } else {
                        final_data.sort(function(a, b) {
                            if(direction == "asc") {
                                return parseFloat(a[sort_by] - b[sort_by])
                            } else {
                                return parseFloat(b[sort_by] - a[sort_by])
                            }
                        })
                        res.status(200).send({"posts" : final_data})
                    }
                });
            })
        }
        request("https://api.hatchways.io/assessment/blog/posts?tag=", tags)
    }
})

app.listen(process.env.PORT || 3000, () => {
});

module.exports = app