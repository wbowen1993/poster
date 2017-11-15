var fs = require('fs');
var http = require('http');
var request = require('request');

var count = 0;
var download_count = 0;
var repeated_count = 0;

var path = 'data/movie.json';

var imgs = [];
var id_set = [];
var n_fold = 20;
var base_url = 'image.tmdb.org';
// var base_url = 'http://image.tmdb.org/t/p/w185';

var obj = JSON.parse(fs.readFileSync(path).toString());
obj = obj['movie'];

for(var i = 0;i < obj.length;i++){
	if(obj[i]['languages'].length>0&&obj[i]['budget']!=0&&obj[i]['genres'].length>0&&obj[i]['poster_path']!=null&&obj[i]['actor'].length==3){
		if(id_set.indexOf(obj[i]['id'])==-1)
			id_set.push(obj[i]['id']);
		else{
			repeated_count++;
			continue;
		}
		imgs.push({
			url:obj[i]['poster_path'],
			id:obj[i]['id']
		});
	}
	else{
		count++;
		// console.log(obj[i]['actor']);
		console.log('\x1b[31m%s\x1b[33m%s\x1b[0m',"[Failed]","["+count+"]--[Id]:"+obj[i]['id']);
	}
}

function judgeZeroRating(arr){
	for(var i = 0;i<arr.length;i++){
		if(arr[i] == 0)
			return 0;
	}
	return 1;
}

var download = function(url, dest, index) {
	var file = fs.createWriteStream(dest);
	http.get({host:base_url,path:'/t/p/w185'+url,port:80,method:'GET'}, function(response) {
		console.log("[status code]:"+response.statusCode);
	    if (response.statusCode != 200) {
			console.log("non-200 response status code:" + response.statusCode);
			console.log("for url:" + url);
			return;
	    }
	    console.log('\x1b[36m%s\x1b[0m','['+index+']Successfilly downloaded');
		response.pipe(file);
		download_count++;
		wait(20);
	});
};
// console.log(imgs[892].url);
var sub = Math.ceil(imgs.length/n_fold);
for(var j = 0;j<n_fold;j++){
	for(var i = j*sub;i<(j!=n_fold-1?(j+1)*sub:imgs.length);i++) {
		download(imgs[i].url, 'data/poster/' + String(i + 1) + '.jpg',i);
	}
}


function wait(ms) {
    var start = Date.now(),
        now = start;
    while (now - start < ms) {
		now = Date.now();
    }
}