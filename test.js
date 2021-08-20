const fs = require('fs');
const url = require('url');
const http = require('http');
const querystring = require('querystring');

const port = 3000;
const server = http.createServer();

server.on('request', (req, res) => {
	if(req.url === '/'){
		const main = fs.createReadStream('./html/main.html');
		res.writeHead(200,{"Content-Type":"text/html"});
		main.pipe(res);
	}
	else if(req.url === '/favicon.ico'){
		const icon = fs.createReadStream('./images/favicon.ico');
		res.writeHead(200,{"Content-Type":"image/x-icon"});
		icon.pipe(res);
	}
	else if(req.url.startsWith('/images')){
		let imageStream = fs.createReadStream(`.${req.url}`);
		imageStream.on('error',err => {
			res.writeHead(404,{"Content-Type":"text/html"});
			res.write("<h1>404 Not Found</h1>", () => {
				res.end();
			});
		});
		imageStream.on('ready', () => {
			res.writeHead(200, {"Content-Type":"image/gif"});
			imageStream.pipe(res);
		});
	}
	else if(req.url.startsWith('/convert')){
		let body = "";
		req.on('data',function(chunk){
			body += chunk;
		});
		req.on('end', function(){
			const userInput = querystring.decode(body);
			const sentenceToConvert = userInput.words;
			let letterArray = [];
			for(let i=0;i<sentenceToConvert.length;i++){
				let currentLetter = sentenceToConvert[i].toLowerCase();
				if((currentLetter.charCodeAt(0) >= 97 && currentLetter.charCodeAt(0) <= 122) || (currentLetter.charCodeAt(0) >= 48 && currentLetter.charCodeAt(0) <= 57) || currentLetter.charCodeAt(0) == 33 || currentLetter.charCodeAt(0) == 64 || currentLetter.charCodeAt(0) == 38 || currentLetter.charCodeAt(0) == 36 || currentLetter.charCodeAt(0) == 63 || currentLetter.charCodeAt(0) == 32){
					if(currentLetter.charCodeAt(0) == 63){
						letterArray.push(`<img src="./images/questionmark.gif" width="145">`);
					}
					else if(currentLetter.charCodeAt(0) == 32){
						letterArray.push(`<img src="./images/blank.png" width="145">`);
					}
					else{
						letterArray.push(`<img src="./images/${currentLetter}.gif" width="145">`);
					}
				}
			}
			res.writeHead(200,{"Content-Type":"text/html"});
			const images = letterArray.join('');
			res.end(`${images}`);
		});
	}
	else{
		res.writeHead(404,{"Content-Type":"text/html"});
		res.end(`<h1>404 Not Found</h1>`);
	}
});

server.on('listening', () => {
	console.log(`Now listening on port ${port}`);
});

server.listen(port);