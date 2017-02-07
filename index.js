const Fs = require('fs');
const Path = require('path');
const Request = require('request');
const Restler = require('restler');

const config = JSON.parse(Fs.readFileSync('./config.json'));

const imgDir = config.imgDir;
const username = config.username;
const password = config.password;


// Read the /img directory
Fs.readdir(imgDir, (err, files) => {
    if(err) return console.log(err);

    files = files.filter(element => {
		return ['.png', '.jpg'].includes(Path.extname(element));
	});

    if(!files.length) return console.log('/img directory contains no images.');
    
    var randFile = randomInt(0, files.length);
    console.log('PP will be switch with : ' + files[randFile]);

    updateAvatar(imgDir + files[randFile]);
});

// Connect to Leek Wars and update the avatar
function updateAvatar(filePath) {
	// Retrieve token
	Request({
		url: 'https://leekwars.com/api/farmer/login-token/' + username + '/' + password
	}, (error, response, body) => {
		if(error) {
			console.log(error);
			return;
		}
		if(response.statusCode != 200) {
			console.log(response);
			return;
		}

		var token = JSON.parse(body).token;

		// Update avatar
		Fs.stat(filePath, (err, stats) => {
		    Restler.post('https://leekwars.com/api/farmer/set-avatar/avatar', {
		        multipart: true,
		        data: {
		            "token": token,
		            "avatar": Restler.file(filePath, null, stats.size, null, "image/png")
		        }
		    }).on("complete", data => {
		        console.log(data);
		    });
		});
	});
}

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
