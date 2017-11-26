import numpy as np
import csv
import json
import colorsys
from PIL import Image
from os import listdir
import time
from os.path import isfile, join

def returnMainHue(hues):
    mapping = {}
    for i in range(0, 12):
        mapping[i] = 0
    for hue in hues:
        hueNotFound = True
        while hueNotFound:
            for i in range(0, 12):
                if hue >= i*30/360.0 and hue < (i+1)*30/360.0:
                    mapping[i] += 1
                    hueNotFound = False
                    break
    maxHue = 0
    for i in range(1, 12):
        if mapping[i] > mapping[maxHue]:
            maxHue = i

    return maxHue              

def readImgParameters(filename):
    img_file = Image.open(filename)
    img = img_file.load()
    [xs, ys] = img_file.size
    hues = []
    saturations = []
    lightness = []
    rs = []
    gs = []
    bs = []

    for x in range(0, xs):
        for y in range(0, ys):
            if type(img[x, y]) == type(1):
                r = g = b = img[x, y]
            else:
                if len(img[x,y]) == 4:
                    [r, g, b, alpha] = img[x, y]
                else:
                    [r, g, b] = img[x, y]
            rs.append(r/255.0)
            gs.append(g/255.0)
            bs.append(b/255.0)
            [h, s, v] = colorsys.rgb_to_hsv(r, g, b)
            hues.append(h)
            saturations.append(s)
            lightness.append(v)

    output = {}
    output["MainHue"] = returnMainHue(hues)
    output["AverageHue"] = np.average(hues)
    output["AverageSat"] = np.average(saturations)
    output["AverageLtn"] = np.average(lightness)
    output["R"] = np.average(rs)
    output["G"] = np.average(gs)
    output["B"] = np.average(bs)
    return output

poster_path = 'data/poster/'
result_path = 'data/table.csv'
genres_path = 'data/genre.json'
movie_path = 'data/movie.json'

poster_list = listdir(poster_path)
del poster_list[0]



with open(genres_path) as json_data:
	obj = json.load(json_data)
obj = obj['genres']

genres_list = []
for genre in obj:
	genres_list.append(genre['id'])

# print "All genres id:",genres_list

with open(movie_path) as json_data:
    obj = json.load(json_data)
obj = obj['movie']

movie_list = []
id_set = []
for i in range(len(obj)):
	if(len(obj[i]['languages'])>0 and obj[i]['budget']!=0 and len(obj[i]['genres'])>0 and len(obj[i]['actor'])==3):
		if(obj[i]['id'] not in id_set):
			id_set.append(obj[i]['id'])
		else:
			continue
		movie_list.append(obj[i])

# print len(movie_list)

writer = csv.writer(open(result_path,'wt'))
column_name = ['id','adult','budget','date','duration','r','g','b','mainHue','avgHue','avgSat','avgLtn','actor-1','actor-2','actor-3','director']
genres_array = []
for i in range(len(genres_list)):
	genres_array.append('genre-'+str(i+1))
column_name = column_name + genres_array
column_name.append('rating')
# print len(column_name)
writer.writerow(column_name)

start_time = time.time()
for i in range(len(movie_list)):
	column = [movie_list[i]['id'],
				movie_list[i]['adult'],
				movie_list[i]['budget'],
				movie_list[i]['date'],
				movie_list[i]['duration']]
	img_params = readImgParameters(poster_path + poster_list[i])
	img_params_list = [img_params['R'],
						img_params['G'],
						img_params['B'],
						img_params['MainHue'],
						img_params['AverageHue'],
						img_params['AverageSat'],
						img_params['AverageLtn']]
	column = column + img_params_list
	
	pre_genres_list = []
	for k in range(len(genres_list)):
		pre_genres_list.append(0)

	for j in range(3):
		column.append(movie_list[i]['actor'][j])
	column.append(movie_list[i]['director'][0])

	for genre in movie_list[i]['genres']:
		pre_genres_list[genres_list.index(genre)] = 1

	column = column + pre_genres_list
	column.append(movie_list[i]['rating'])
	writer.writerow(column)

	end_time = time.time()
	now_time = end_time - start_time
	remaining_time = (1.0 * (end_time - start_time)) / (1.0*(i+1)/len(movie_list)) - now_time
	remaining_min = int(remaining_time / 60)
	remaining_sec = int(remaining_time) % 60

	print "[",i+1,"/",len(movie_list),"] Being written.......","{0:.2f}".format(now_time),"s/",remaining_min,"min",remaining_sec,"s.........",'{:.2%}'.format(1.0*(i+1)/len(movie_list)),"[ID]:",movie_list[i]['id']
print "write finished"




