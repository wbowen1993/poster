var fs = require('fs');
var http = require('http');
var url = require('url');
var request = require('sync-request');

var api_key = "fca45c53935c767a8c764b056f466027";

var movie_id_path = 'data/movies_ids.json';
var movie_path = 'data/movie-';

var content = JSON.parse(fs.readFileSync(movie_id_path).toString());

var movie_count = 0;

var movie = [];

var movie_ids = [];

var n_folds = 10;
content['movies'].forEach(function(e,i){
	movie_ids.push(e);
});

function getMovieInfo(id){

	var url = "http://api.themoviedb.org/3/movie/" + id + "?language=en-US&api_key=" + api_key;

	var res = request('GET',url);
	
	var genres = [];
	var languages = [];
	// console.log("2.res['x-ratelimit-remaining']:"+res.headers['x-ratelimit-remaining']);
        
	try{
		var obj = JSON.parse(res.body.toString());

		obj['genres'].forEach(function(e){
			genres.push(e['id']);
		});
		obj['spoken_languages'].forEach(function(e){
			languages.push(e['iso_639_1']);
		});
	}
	catch(e){
    	console.log(obj)
    	console.log("[ERROR-1]: "+e);
    	return;
	}	

	if(res.headers['x-ratelimit-remaining']==0){
		console.log('[1].TEST');
	    wait(11*1000);
    }

    if(languages.length == 0||obj['budget']==0)
    	return;

	var crew = getActorList(id);


	console.log(crew);

	if(crew.actor.length>0&&crew.director.length>0){
		movie_count++;
		console.log('\x1b[32m%s\x1b[0m',movie_count+'.[PUSHED].'+obj['title']);
		movie.push({
			id:obj['id'],
			adult:obj['adult']==true?1:0,
			title:obj['title'],
			budget:obj['budget'],
			genres:genres,
			poster_path:obj['poster_path'],
			date:obj['release_date'].substring(0,4),
			duration:obj['runtime'],
			languages:languages,
			rating:obj['vote_average'],
			actor:crew.actor,
			director:crew.director
		});
	}
}

function getActorList(id){
	var url = "https://api.themoviedb.org/3/movie/" + id + "/credits?api_key=" + api_key;

	var res = request('GET',url);
	var obj = JSON.parse(res.body.toString());

	// console.log("3.res['x-ratelimit-remaining']:"+res.headers['x-ratelimit-remaining']);

	if(res.headers['x-ratelimit-remaining']==0){
		console.log('[2].TEST');
	    wait(11*1000);
    }

	var actor = [];
	var director = [];
	try{
		for(var i = 0;i<obj['cast'].length;i++){
			if(actor.length == 3)
				break;
			if(obj['cast'][i]['order']<10){
				var rating = getPeopleRating(obj['cast'][i]['id'],'cast');
				if(rating!=-1)
					actor.push(rating);
			}
		}
		for(var i = 0;i<obj['crew'].length;i++){
			if(obj['crew'][i]['job'] == 'Director'){
				director.push(getPeopleRating(obj['crew'][i]['id'],'crew'));
				break;
			}
		}
	}
	catch(e){
    	console.log(obj);
    	console.log("[ERROR-2]: "+e);
    	return {actor:[],director:[]};
	}

	return {actor:actor,director:director};
}

function getPeopleRating(id,type){
	var url = "https://api.themoviedb.org/3/person/" + id + "/movie_credits?language=en-US&api_key=" + api_key;

	var res = request('GET',url);
	var obj = JSON.parse(res.body.toString());

	// console.log("4.res['x-ratelimit-remaining']:"+res.headers['x-ratelimit-remaining']);

	var rating = [];
	var sum = 0;
	try{
		obj[type].sort(function(a,b){
			return new Date(a.release_date) - new Date(b.release_date);
		});

		obj[type].forEach(function(e){
			if(e['vote_average']!=0)
				rating.push(e['vote_average']);
		});
	}
	catch(e){
    	console.log("[ERROR-3]: "+e);
    	return -1;
	}

	rating.forEach(function(e){
		sum += e;
	});

	if(res.headers['x-ratelimit-remaining']==0){
		console.log('[3].TEST');
	    wait(11*1000);
    }
	return (sum/rating.length).toFixed(2);
}

function main(){

	movie_ids = movie_ids.slice(12600,30000);
	var sub = Math.ceil(movie_ids.length/n_folds);
	for(var i = 0;i<n_folds;i++){
		movie = [];
		if(i!=n_folds - 1){
			for(var j = i*sub;j<(i + 1)*sub;j++)
				getMovieInfo(movie_ids[j]);
		}
		else{
			for(var j = i*sub;j<movie_ids.length;j++)
				getMovieInfo(movie_ids[j]);
		}
		var obj = {
			"movies":movie,
			"total_results":movie.length
		};
		var content = JSON.stringify(obj,null,4);
		var path = movie_path + parseInt(10 + i) +'.json';
		fs.writeFileSync(path,content);
		console.log('\x1b[36m%s\x1b[0m','[Write Successfully]:'+path)
	}
}

function wait(ms) {
    var start = Date.now(),
        now = start;
    while (now - start < ms) {
		now = Date.now();
    }
}

main();
