var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var fs = require('fs');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static(__dirname));

function up_date() {
    today = new Date();
    day = today.getDate();
    month = today.getMonth();
    year = today.getFullYear();
    hours = today.getHours();
    minutes = today.getMinutes();
    seconds = today.getSeconds();
    datestr = year.toString() + '/' + month.toString() + '/' + day.toString() + ' ' + hours.toString() + ':' + minutes.toString() + ':' + seconds.toString()
    return datestr
}

var server = app.listen(process.env.PORT, function(){
    var host = '0.0.0.0';
    var port = process.env.PORT || 8888;
});


// TESTING
/*var server = app.listen(8888, function(){
    console.log("Listening at http://localhost:8888/");
});*/

app.get('/', function(req, res) {
    file = fs.readFileSync('./posts.json', 'utf8');
    //posts = fs.readFileSync("./posts.txt", "utf8").toString().split('\n');
    posts = JSON.parse(file);
    //revposts = posts.slice().reverse();
    revposts = posts.slice().sort(function(a, b) {return a.likes - b.likes}).reverse();
    //posts = 'fsdasfdafsd';

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
                    </form>
                </div>
                <div>
                    <p>posts (` + revposts.length.toString() + ` total):</p>
                    <ul id="parent">
                `;

    revposts.forEach(db => {
        ht += `<br>`
        ht += `<li>`
        ht += `<form action="/like" method="POST" style="display: inline;">`;
        ht += `${db.user} posted: ${db.content} at ${db.date} (likes: ${db.likes}) `;
        ht += `<input type="hidden" type="text" value="1" name="action">`;
        ht += `<input type="hidden" type="text" value="${db.id}" name="id">`;
        ht += `<button type="submit" value="submit" style="display: inline;">like</button>`;
        ht += `</form> `;
        ht += `<form action="/like" method="POST" style="display: inline;">`;
        ht += `<input type="hidden" type="text" value="0" name="action">`;
        ht += `<input type="hidden" type="text" value="${db.id}" name="id">`;
        ht += `<button class="nowrap" type="submit" value="submit" style="display: inline;">dislike</button>`;
        ht += `</form>`;
        ht += `</li>`;
    });

    ht += `     </ul>
                </div>
                    <br>
                    <p><a href="https://github.com/guiszk">github</a></p>
            </body>
        </html>
    `
    res.set('text/html').send(ht);
});

app.post('/post', urlencodedParser, function(req, res){
    file = fs.readFileSync('./posts.json', 'utf8');
    posts = JSON.parse(file);
    //revposts = posts.slice().reverse();
    revposts = posts.slice().sort(function(a, b) {return a.likes - b.likes}).reverse();

    response = {
        id : posts.length + 1,
        user : req.body.user,
        content : req.body.post,
        date : up_date(),
        likes : 0
    };

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
            ht += `\n<p>${db.user}\'s previous posts: ${db.content} at ${db.date} (likes: ${db.likes})</p>`;
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

function like(id, action) {
    file = fs.readFileSync('./posts.json', 'utf8');
    posts = JSON.parse(file);
    posts.forEach(db => {
        if(db.id == id) {
            if(action) {
                db.likes += 1;
            } else {
                db.likes -= 1;
            }
        }
    });
    fs.writeFile('./posts.json', JSON.stringify(posts, null, 4), (err) => {
        if (err) throw err;
    });
}

app.post('/like', urlencodedParser, function(req, res){
    response = {
        id : req.body.id,
        action : req.body.action
    };
    if(response['action'] == 1) {
        like(response['id'], 1);
    } else {
        like(response['id'], 0);
    }
    res.redirect("/");
});
