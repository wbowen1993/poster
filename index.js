var fs = require('fs');
var http = require('http');
var url = require('url');
var request = require('sync-request');

var api_key = "fca45c53935c767a8c764b056f466027";

var genre_path = 'data/genre.json';
var movie_id_path = 'data/movies_ids.json';

var content = JSON.parse(fs.readFileSync(genre_path).toString());

var request_count = 0;

var movie_count = 0;

var count = {
	added:0,
	missing:0
}

var id_set = [];
//collect genre id
var genre = [];
var movie = [];
var movie_ids = [];
content['genres'].forEach(function(e,i){
	genre.push({
		id:e['id'],
		name:e['name']
	});
});


function getMovieIdByGenre(genre){
	var page = 1;

	var total_pages = genre.total_pages;

	while(page < total_pages/5){
		var url = "http://api.themoviedb.org/3/genre/" + genre.id + "/movies?sort_by=created_at.asc&include_adult=false&language=en-US&api_key=" + api_key + "&page=" + page;
	    
	    var res = request('GET',url);
		
		// console.log("1.res['x-ratelimit-remaining']:"+res.headers['x-ratelimit-remaining']);
    
        var obj = JSON.parse(res.body.toString());

	    if(res.headers['x-ratelimit-remaining']==0){
			console.log('TESTSTSTSTST');
		    wait(10*1000);
	    }

        try{
            var len = obj['results'].length;
        }
        catch(e){
        	console.log(obj)
        	console.log("[ERROR-1]: "+e);
        	return;
        }


        for(var i = 0;i<len;i++){
        	movie_count++;
        	console.log(movie_count+'.['+genre.name+'] Id: '+obj['results'][i]['id']+", Title: "+obj['results'][i]['title']+" in page No."+page);
        	// getMovieInfo(obj['results'][i]['id']);
        	var verified_res = verify(obj['results'][i]);
        	if(id_set.indexOf(obj['results'][i]['id'])==-1&&verified_res==0){
        		movie_ids.push(obj['results'][i]['id']);
        		id_set.push(obj['results'][i]['id']);
        		console.log('\x1b[32m%s\x1b[0m','[ADDED]');
        		count.added++;
        	}
        	else if(verified_res==0){
        		console.log('\x1b[33m%s\x1b[0m','[REPEATED]');
        	}
        	else{
        		console.log('\x1b[31m%s\x1b[0m','[MISSING_INFO]');
        		count.missing++;
        	}
        }

	    page++;

	}

}

function getMovieInfo(id){

	var url = "http://api.themoviedb.org/3/movie/" + id + "?language=en-US&api_key=" + api_key;

	var res = request('GET',url);
	
	var genres = [];
	var languages = [];
	// console.log("2.res['x-ratelimit-remaining']:"+res.headers['x-ratelimit-remaining']);
        
	try{
		var obj = JSON.parse(res.body.toString());

		if(new Date(obj['release_date']) - Date.now() > 0)
			return;

		if(id_set.indexOf(obj['id'])!=-1)
			return;
		obj['genres'].forEach(function(e){
			genres.push(e['id']);
		});
		obj['spoken_languages'].forEach(function(e){
			languages.push(e['iso_639_1']);
		});
	}
	catch(e){
    	console.log(obj)
    	console.log("[ERROR-2]: "+e);
    	return;
	}

	

	if(res.headers['x-ratelimit-remaining']==0){
		console.log('TESTSTSTSTST');
	    wait(10*1000);
    }

	var crew = getActorList(id);

	console.log(crew);

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

	id_set.push(obj['id']);

}

function getActorList(id){
	var url = "https://api.themoviedb.org/3/movie/" + id + "/credits?api_key=" + api_key;

	var res = request('GET',url);
	var obj = JSON.parse(res.body.toString());

	// console.log("3.res['x-ratelimit-remaining']:"+res.headers['x-ratelimit-remaining']);

	if(res.headers['x-ratelimit-remaining']==0){
		console.log('TESTSTSTSTST');
	    wait(10*1000);
    }

	var actor = [];
	var director = [];
	try{
		obj['cast'].forEach(function(e){
			if(e['order']<3)
				actor.push(getPeopleRating(e['id'],'cast'));
			if(actor.length==Math.min(3,obj['cast'].length))
				return;
		});
		obj['crew'].forEach(function(e){
			if(e['job'] == 'Director'&&director.length<2){
				director.push(getPeopleRating(e['id'],'crew'));
			}
		});
	}
	catch(e){
    	console.log(obj);
    	console.log("[ERROR-3]: "+e);
    	return;
	}

	if(res.headers['x-ratelimit-remaining']==0){
		console.log('TESTSTSTSTST');
	    wait(10*1000);
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
	obj[type].sort(function(a,b){
		return new Date(a.release_date) - new Date(b.release_date);
	});

	obj[type].forEach(function(e){
		if(new Date(e['release_date']) - Date.now() < 0)
			rating.push(e['vote_average']);
		if(rating.length == 3)
			return;
	});

	rating.forEach(function(e){
		sum += e;
	});

	if(res.headers['x-ratelimit-remaining']==0){
		console.log('TESTSTSTSTST');
	    wait(10*1000);
    }
	return (sum/rating.length).toFixed(2);
}

function getTotalPagesByGenres(genre){
    var url = "http://api.themoviedb.org/3/genre/" + genre.id + "/movies?sort_by=created_at.asc&include_adult=false&language=en-US&api_key=" + api_key +"&page=1";
	var res = request('GET',url);    
	var obj = JSON.parse(res.body.toString());
	if(res.headers['x-ratelimit-remaining']==0){
		console.log('TESTSTSTSTST');
	    wait(10*1000);
    }
	return obj['total_pages'];
}

function main(){
	for(var i = 0;i<genre.length;i++){
		genre[i].total_pages = getTotalPagesByGenres(genre[i]);
		getMovieIdByGenre(genre[i]);	
	}
	var obj = {
		"movies":movie_ids,
		"total_results":movie_ids.length
	};
	var content = JSON.stringify(obj,null,4);
	fs.writeFileSync(movie_id_path,content);
	console.log('\x1b[33m%s\x1b[31m%s\x1b[0m','[ADDED]'+count.added,' [MISSING_INFO]'+count.missing);
}

main();

function verify(obj){
	if(new Date(obj['release_date']) - Date.now() > 0||obj['genre_ids'].length==0||obj['poster_path']==null||obj['vote_average']==0)
		return -1;
	return 0;
}


function wait(ms) {
    var start = Date.now(),
        now = start;
    while (now - start < ms) {
		now = Date.now();
    }
}