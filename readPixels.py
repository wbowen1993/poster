import numpy as np
#import mpl_toolkits.mplot3d.axes3d as p3
#import matplotlib.pyplot as plt
import colorsys
from PIL import Image

from os import listdir
from os.path import isfile, join
mypath = 'data/poster/'
count = 0

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
    
for f in listdir(mypath):
    count += 1
    if(count > 1):
        params = readImgParameters(mypath + f)
        print "Max Hue for [",f,"]: ", params['MainHue']


    
    
