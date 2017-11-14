var fs = require('fs');
var http = require("https");

var output_path = 'data/genre.json';

var options = {
  "method": "GET",
  "hostname": "api.themoviedb.org",
  "port": null,
  "path": "/3/genre/movie/list?language=en-US&api_key=fca45c53935c767a8c764b056f466027",
  "headers": {}
};

var req = http.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
	var obj = JSON.parse(chunks.toString());
	obj = JSON.stringify(obj,null,4);
	fs.writeFileSync(output_path,obj);
  });
});

req.write("{}");
req.end();
