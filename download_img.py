import requests
import json

path = 'data/movie.json'
with open(path) as json_data:
    obj = json.load(json_data)
obj = obj['movie']

id_set = []
imgs = []

repeated_count = 0
count = 0
base_url = 'http://image.tmdb.org/t/p/w185'

def prefix_zero(num):
	if num<10:
		return "0000" + str(num)
	elif num<100:
		return "000"+str(num)
	elif num<1000:
		return "00"+str(num)
	else:
		return "0"+str(num)

for i in range(len(obj)):
	if(len(obj[i]['languages'])>0 and obj[i]['budget']!=0 and len(obj[i]['genres'])>0 and len(obj[i]['actor'])==3):
		if(obj[i]['id'] not in id_set):
			id_set.append(obj[i]['id'])
		else:
			repeated_count+=1
			continue
		imgs.append(base_url + obj[i]['poster_path'])
	else:
		count+=1
print len(imgs)

for i in range(len(imgs)):
	image_url = imgs[i]
	img_data = requests.get(image_url).content
	subpath = 'data/poster/' + prefix_zero(i) + '.jpg'
	with open(subpath, 'wb') as handler:
	    handler.write(img_data)