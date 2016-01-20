#!/usr/bin/env python
#!C:\Users\arvind.chari\AppData\Local\Continuum\Anaconda\python.exe -u

#Module to be imported to master scripts for Bokeh Plotting Software
#Started By Kevin Zhai during Summer 2015 internship
#Continued by Arvind Chari
#Modified: 11/5/15

import numpy as np

def is_number(s):
    try:
    	if s is not None:
        	float(s)
        	return True
    except ValueError:
        return False

def stats(items, cl) :
	avg = np.mean(items)
	std = np.std(items)
	ucl = (cl * std) + avg
	lcl = avg - (cl * std)
	return {'avg':avg, 'std':std, 'ucl':ucl, 'lcl':lcl}

def liststats(items, cl) :
	if len(items) == 0:
		return {'avg':None, 'std':None, 'ucl':None, 'lcl':None}
	avg = []
	std = []
	for x in items : 
		for i in range(len(x)) : 
			if x[i] != -1:
				temp = x[i] #list comprehenstion to obtain the ith element of each list and average them 
				avg.append(np.mean(temp))
				std.append(np.std(temp))
	ucl = [(x + (cl * y)) for x,y in zip(avg, std)] #list comprehension and zip function to add the std to the avg)
	lcl = [(x - (cl * y)) for x,y in zip(avg, std)]
	return {'avg':avg, 'std':std, 'ucl':ucl, 'lcl':lcl}

def normalize(items) :
	normalized = []
	for j in items:
		sixteen = j[7]
		temp = []
		for k in j:
			if (sixteen != 0):
				temp.append(round(k/sixteen,4))
			else : 
				temp.append(1)
		normalized.append(temp)
	return normalized



