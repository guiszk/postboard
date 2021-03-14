var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var fs = require('fs');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static(__dirname));

today = new Date();
day = today.getDate();
month = today.getMonth();
year = today.getFullYear();
hours = today.getHours();
minutes = today.getMinutes();
seconds = today.getSeconds();
datestr = year.toString() + '/' + month.toString() + '/' + day.toString() + ' ' + hours.toString() + ':' + minutes.toString() + ':' + seconds.toString()

var server = app.listen(process.env.PORT, function(){
    var host = '0.0.0.0';
    var port = process.env.PORT || 8888;
});

// TESTING
/*
var server = app.listen(8888, function(){
    console.log("Listening at http://localhost:8888/");
});*/

app.get('/', function(req, res) {
    file = fs.readFileSync('./posts.json', 'utf8');
    //posts = fs.readFileSync("./posts.txt", "utf8").toString().split('\n');
    posts = JSON.parse(file);
    revposts = posts.slice().reverse();
    //posts = 'fsdasfdafsd';
    //console.log(posts)

    ht = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>postboard</title>
            </head>
            <body>
                <div>
                    <form action="/post" method="POST">
                    <p>User: <input type="text" value="user" name="user"></p>
                    <p>Post: <input type="text" value="post" name="post"></p>
                    <p><button id="postbtn" type="submit" value="submit">post</button></p>
                </div>
                <div>
                    <p>posts (` + revposts.length.toString() + ` total):</p>`

    revposts.forEach(db => {
        ht += `\n<p>${db.user} posted: ${db.content} at ${db.date}</p>`;
    });

    ht += `
                </div>
                    <br>
                    <p><a href="https://github.com/guiszk">github</a></p>
            </body>
        </html>
    `
    res.set('text/html').send(ht);
});

app.post('/post', urlencodedParser, function(req, res){
    response = {
        user : req.body.user,
        content : req.body.post,
        date : datestr
    };


    /*fs.readFile('posts.json', 'utf8', (err, data) => {
        if (err) throw err;

        const databases = JSON.parse(data);
        databases.push(response);
        fs.writeFile('./posts.json', JSON.stringify(databases, null, 4), (err) => {
            if (err) throw err;
        });
    });*/
    file = fs.readFileSync('./posts.json', 'utf8');
    posts = JSON.parse(file);
    revposts = posts.slice().reverse();

    ht = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>postboard: posts</title>
            </head>
            <body>
                <p>text</p>
                <form action="/" method="GET">
                <p>User ` + response['user'] + ` posted: ` + response['content'] + ` at: ` + response['date'] +`</p>`
    revposts.forEach(db => {
        if(db.user == response['user']) {
            ht += `\n<p>${db.user}\'s previous posts: ${db.content} at ${db.date}</p>`;
        }
    });

    posts.push(response);
    fs.writeFile('./posts.json', JSON.stringify(posts, null, 4), (err) => {
        if (err) throw err;
    });

    ht += `
                <p><button id="backbtn" type="submit" value="submit">back</button></p>
            </body>
        </html>
    `
    res.set('text/html').send(ht);
});
