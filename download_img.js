var fs = require('fs');
var http = require('http');

var count = 0;

var path = 'data/movie.json';

var imgs = [];

var base_url = 'http://image.tmdb.org/t/p/w185/';

var obj = JSON.parse(fs.readFileSync(path).toString());

for(var i = 0;i < obj['movie'].length;i++){
	if(obj['movie'][i]['budget']!=0){
		imgs.push({
			url:base_url + obj['movie'][i]['poster_path'],
			id:obj['movie'][i]['id']
		});
	}
	else{
		count++
		console.log("["+count+"]---[Index]:"+i+",[PATH]:"+obj['movie'][i]['id']);
	}
}

var download = function(url, dest) {
	var file = fs.createWriteStream(dest);
	http.get(url, function(response) {
		response.pipe(file);
	});
};
 
// imgs.forEach(function(img, index) {
// 	try{
// 		download(img.url, 'data/poster/' + String(index + 1) + '.jpg');
// 	}
// 	catch(e){
// 		console.log(e)
// 		console.log('\x1b[31m%s\x1b[0m','[INDEX]:'+index+'  [ID]:'+img.id);
// 	}
// });