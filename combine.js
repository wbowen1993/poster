var fs = require('fs');

var output_path = 'data/movie.json';

var data_folder = 'data/';

var movie = [];

var files = fs.readdirSync(data_folder);

for(var file in files){
	if(files[file].indexOf('movie-')!=-1){
		var obj = JSON.parse(fs.readFileSync(data_folder + files[file]).toString());
		// console.log("[File Results]:"+obj['total_results']);
		movie = movie.concat(obj['movies']);
	}
}

var obj = {
	movie:movie,
	total_results:movie.length
};

fs.writeFileSync(output_path,JSON.stringify(obj,null,4));