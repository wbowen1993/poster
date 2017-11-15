var fs = require('fs');

var output_path = 'data/movie.json';

var data_folder = 'data/';

var movie = [];

var result = [];

var id_set = [];

var files = fs.readdirSync(data_folder);


for(var file in files){
	if(files[file].indexOf('movie-')!=-1){
		var obj = JSON.parse(fs.readFileSync(data_folder + files[file]).toString());
		// console.log("[File Results]:"+obj['total_results']);
		movie = movie.concat(obj['movies']);
	}
}

//remove repeated
for(var i = 0;i<movie.length;i++){
	if(id_set.indexOf(movie[i]['id'])==-1){
		id_set.push(movie[i]['id']);
		result.push(movie[i]);
	}
}

var obj = {
	movie:result,
	total_results:result.length
};
fs.writeFileSync(output_path,JSON.stringify(obj,null,4));
