var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var dateFns = require('date-fns');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));

const { Client } = require('pg')
const connectionString = process.env.CONNECTURI;

const client = new Client({ connectionString, })

client.connect()

app.get('/', (req, res) => {
    // get all posts from db
    query = 'SELECT * FROM posts;';
    client.query(query, (err, pgres) => {
        if (err) {
            console.error(err);
            return;
        }
        sorted = pgres.rows.slice().sort(function (a, b) { return a.id - b.id }).reverse();
        res.render('index', { posts: sorted });
    });
})

// create new post
app.post('/', urlencodedParser, function (req, res) {
    now = new Date();
    response = {
        posttitle: req.body.title,
        content: req.body.content,
        date: dateFns.format(now, 'yyyy-MM-dd hh:mm:ss'),
    };

    const query = `
        INSERT INTO posts (title, content, date)
        VALUES ('${response['posttitle']}', '${response['content']}', '${response['date']}')
    `;
    client.query(query, (err, res) => {
        if (err) {
            console.error(err);
            return;
        }
    });
    res.redirect("/");
});

// uncomment to run locally
/* app.listen(8080, () => {
    console.log('listening on http://localhost:8080');
}); */

// run
var server = app.listen(process.env.PORT, function () {
    var host = '0.0.0.0';
    var port = process.env.PORT || 8888;
});