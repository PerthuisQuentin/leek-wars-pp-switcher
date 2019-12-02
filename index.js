const Fs = require('fs')
const Path = require('path')

const Request = require('request')

const config = JSON.parse(Fs.readFileSync('./config.json'))

const randomInt = (low, high) => Math.floor(Math.random() * (high - low) + low)

// Read the /img directory
const chooseAvatar = path => new Promise((resolve, reject) => {
	Fs.readdir(path, (error, files) => {
		if(error) return reject(error)
	
		const images = files.filter(file => ['.png', '.jpg'].includes(Path.extname(file)))
	
		if(!images.length) return reject('/img directory does not contains images.')
		
		const randIndex = randomInt(0, images.length)
		const choosenFile = images[randIndex]
	
		console.log('New avatar selected : ' + choosenFile)
	
		resolve(path + choosenFile)
	})
})

const getLeekWarsToken = (username, password) => new Promise((resolve, reject) => {
	const options = {
		method: 'GET',
		url: `https://leekwars.com/api/farmer/login-token/${username}/${password}`,
		headers: {
			'Content-Type': 'application/json'
		}
	}
	
	Request(options, (error, result, body) => {
		if (error) reject(error)
		resolve(JSON.parse(body).token)
	})
})

const updateLeekWarsAvatar = (token, image) => new Promise((resolve, reject) => {
	const options = {
		method: 'POST',
		url: 'https://leekwars.com/api/farmer/set-avatar/avatar',
		headers: {
			'Authorization': `Bearer ${token}`,
			'Content-Type': 'multipart/form-data'
		},
		formData : {
			'avatar' : Fs.createReadStream(image)
		}
	}
	
	Request(options, (error, result, body) => {
		if (error) reject(error)
		resolve(body)
	})
})

Promise.all([
	chooseAvatar(config.imageDirectory),
	getLeekWarsToken(config.username, config.password)
])
	.then(result => {
		const [image, token] = result
		return updateLeekWarsAvatar(token, image)
	})
	.then(() => {
		console.log('Success')
	})
	.catch(console.error)