#!C:\Users\arvind.chari\Documents\NewGitTest\Anaconda\python.exe -u
#!/usr/bin/env python

import statfunctions
from numpy import pi
import numpy as np
import sys
import datetime
from bokeh.plotting import figure, output_file, show, gridplot, hplot
from bokeh.models import GlyphRenderer, Circle, HoverTool, Range1d, LinearAxis
from bokeh.models.widgets import Panel, Tabs
from bokeh.charts import Bar
from collections import Counter
from random import randint

import scipy.special


############################################################
#Graph Grid Failures and Reasons for Failure by Position
#Takes Failure Position and Failure Reasons as Inputs
#Outputs figure with failure position and reason graphed
#Size of circle is related to the number of failures, position of failure notes the location on the grid
############################################################

def yield_by_day(daily_accepted, failure_pos) :
  list_accept_by_day = [] #Holds the list of lists of each day accepted
  list_reject_by_day = [] #Holds the list of lists of each day rejected

  current_date_acc = datetime.date(daily_accepted[0].year, daily_accepted[0].month, daily_accepted[0].day) #Set the first date to be the first date in the set. The daily_accepted is just a set of dates
  accept_by_day = [] #Holds a temporary list of all the dates accepted each day
  
  for i in range(len(daily_accepted)) :
    date_without_time_acc = datetime.date(daily_accepted[i].year, daily_accepted[i].month, daily_accepted[i].day) 
    if date_without_time_acc == current_date_acc:
      accept_by_day.append(date_without_time_acc) 
    else:
      if len(accept_by_day) > 0:
        list_accept_by_day.append(accept_by_day) #Creates a list of lists, each list containing the number of grids accepted on a certain day
        accept_by_day = [date_without_time_acc]
        current_date_acc = date_without_time_acc
      else:
        list_accept_by_day.append(.9) #Creates a list of lists, each list containing the number of grids accepted on a certain day
        accept_by_day = [date_without_time_acc]
        current_date_acc = date_without_time_acc

  current_date_rej = datetime.date(failure_pos[0][2].year, failure_pos[0][2].month, failure_pos[0][2].day) #The failure_pos format is [cage 5-8, A,date,Failure_re]
  reject_by_day = [] #Holds a temporary list of all the reject reasons for a given day
  for i in range(len(failure_pos)):
    date_without_time_rej = datetime.date(failure_pos[i][2].year, failure_pos[i][2].month, failure_pos[i][2].day)
    if date_without_time_rej == current_date_rej:
      reject_by_day.append(failure_pos[i][3]) #Every rejected grid has a failure reason. The lenght of this list determines the number of failures in a day
    else:
      if len(reject_by_day) > 0:
        list_reject_by_day.append(reject_by_day) #A list of lists, each list containing all the errors on a specific day. 
        reject_by_day = [failure_pos[i][3]]
        current_date_rej = date_without_time_rej
      else:
        list_reject_by_day.append(.9) #A list of lists, each list containing all the errors on a specific day. 
        reject_by_day = [failure_pos[i][3]]
        current_date_rej = date_without_time_rej


  #Take care of the case when only 1 day is present in the range
  if len(list_accept_by_day) == 0:
    list_accept_by_day.append(accept_by_day)
  if len(list_reject_by_day) == 0:
    list_reject_by_day.append(reject_by_day)

  yield_plot = figure(plot_width=500, plot_height=500, x_axis_label = "Days into Set", y_axis_label="Yield", tools = "pan,box_select,box_zoom,xwheel_zoom,reset,save,resize", background_fill = 'beige', title="Yield by Day")
  temp_yields = []
  temp_dates = []
  temp_colors = choose_colors(list_reject_by_day)[0]
  temp_failure_keys = choose_colors(list_reject_by_day)[1]

  if len(list_accept_by_day) == len(list_reject_by_day) : #assumes at least 1 grid was accepted and rejected every day. If not, this will fail and create no plot
    for i in range(len(list_accept_by_day)) :
      i_reverse = len(list_accept_by_day) - (i + 1)
      temp_yields.append(float(len(list_accept_by_day[i_reverse]))/(float(len(list_reject_by_day[i_reverse]))+float(len(list_accept_by_day[i_reverse]))))
      temp_dates.append(i) ######daily_acc[i][0]##### FOR SOME REASON THIS DOES NOT WORK
      create_circle(temp_dates[i], temp_yields[i], yield_plot, list_reject_by_day[i], .2, temp_colors)

  yield_plot.line(temp_dates, temp_yields, color="red")

  return yield_plot

############################################################
#Graph Grid Failures and Reasons for Failure by Position
#Takes Failure Position and Failure Reasons as Inputs
#Outputs figure with failure position and reason graphed
#Size of circle is related to the number of failures, position of failure notes the location on the grid
############################################################
def create_circle(x_pos, y_pos, t1_figure, t1_total_failures, rad, colors):
  t1_fail_pos_leg = []
  t1_fail_pos_pct = [0]
  starts = []
  ends = []

  #Define starts/ends for wedges from percentages of a circle
  t1_fail_pos_leg.append(Counter(t1_total_failures).keys())
  t1_fail_pos_leg.append(Counter(t1_total_failures).values())
  t1_fail_pos_total = sum(t1_fail_pos_leg[1])

  #Define the start stop percentages for the wedges
  for x in t1_fail_pos_leg[1] :
    y = float(x)
    z = float(t1_fail_pos_total)
    new_pct = float(t1_fail_pos_pct[len(t1_fail_pos_pct)-1]) + (y/z)
    t1_fail_pos_pct.append(new_pct)

  starts = [p*2*pi for p in t1_fail_pos_pct[:-1]]
  ends = [p*2*pi for p in t1_fail_pos_pct[1:]]

  for j in range(len(t1_fail_pos_leg[0])) :
    t1_figure.wedge(x=x_pos, y=y_pos, radius=rad, start_angle=starts[j], end_angle=ends[j], color=colors[t1_fail_pos_leg[0][j]])

  return t1_figure



def choose_colors(t1_total_failures):
  #Making the Legend for the graph
  #Basically, need to assign colors to the different errors
  t1_total_failures = [item for sublist in t1_total_failures for item in sublist] #Flatten the list to make a single list of all the types of failures

  t1_legend = []
  t1_legend.append(Counter(t1_total_failures).keys())
  t1_legend.append(Counter(t1_total_failures).values())

  colors = {}
  return_legend = {}
  for i in range(len(t1_legend[0])):
    #colors.append("#" + '%06X' % randint(0, 0xFFFFFF))
    colors[t1_legend[0][i]] = "#" + '%06X' % randint(0, 0xFFFFFF)
    return_legend[t1_legend[0][i]] = t1_legend[1][i]

  return (colors, return_legend) #Returns a dictionary whihc links the type of failure with a given color


def create_legend(x_pos, y_pos, color_dict, figure, all_failures, num_fails_to_list):
  #Create the Legend for the types of failures we see day to day

  for legend,color in color_dict.iteritems() :
    figure.circle(x=x_pos, y=y_pos, radius=0, color=color, legend=legend)
 
  figure.legend.orientation = "bottom_left"


#Take a list of failure positions and failure reasons and orgainize them by where they are on the grid, and how frequently they occured
def organize_failure(t1_failure_pos) :
  t1_general = []
  t1_l_five = []
  t1_r_five = []
  t1_l_one = []
  t1_r_one = []
  t1_l_tab = []
  t1_r_tab = [] #The positions to put the various graphs in the chart

  t1_l_five_b = []
  t1_r_five_b = [] 
  t1_l_one_b = []
  t1_r_one_b = []
  t1_l_tab_b = []
  t1_r_tab_b = []

  t1_total_failures = [] #A list of lists, where the sublists are the failures of the tab, cage 1-4, and cage 5-8, and then general failures respectively

  for x in range(len(t1_failure_pos)) :
    if t1_failure_pos[x][0] != "" :
      if t1_failure_pos[x][1] == "A" :
        if t1_failure_pos[x][0] == "Right Tab" :
          t1_r_tab.append(t1_failure_pos[x][3])
        elif t1_failure_pos[x][0] == "Left Tab" :
          t1_l_tab.append(t1_failure_pos[x][3])
        elif t1_failure_pos[x][0] == "Right Cage 1-4" :
          t1_r_one.append(t1_failure_pos[x][3])
        elif t1_failure_pos[x][0] == "Left Cage 1-4" :
          t1_l_one.append(t1_failure_pos[x][3])
        elif t1_failure_pos[x][0] == "Right Cage 5-8" :
          t1_r_five.append(t1_failure_pos[x][3])
        elif t1_failure_pos[x][0] == "Left Cage 5-8" :
          t1_l_five.append(t1_failure_pos[x][3])
        else :
          t1_general.append(t1_failure_pos[x][3])
      elif t1_failure_pos[x][1] == "B" :
        if t1_failure_pos[x][0] == "Right Tab" :
          t1_r_tab_b.append(t1_failure_pos[x][3])
        elif t1_failure_pos[x][0] == "Left Tab" :
          t1_l_tab_b.append(t1_failure_pos[x][3])
        elif t1_failure_pos[x][0] == "Right Cage 1-4" :
          t1_r_one_b.append(t1_failure_pos[x][3])
        elif t1_failure_pos[x][0] == "Left Cage 1-4" :
          t1_l_one_b.append(t1_failure_pos[x][3])
        elif t1_failure_pos[x][0] == "Right Cage 5-8" :
          t1_r_five_b.append(t1_failure_pos[x][3])
        elif t1_failure_pos[x][0] == "Left Cage 5-8" :
          t1_l_five_b.append(t1_failure_pos[x][3])
        else :
          t1_general.append(t1_failure_pos[x][3])
      #Need to swap the l and r positions for the backside grids so that they appear the same way on the boards
      elif t1_failure_pos[x][1] == "C" :
        if t1_failure_pos[x][0] == "Right Tab" :
          t1_l_tab.append(t1_failure_pos[x][3])
        elif t1_failure_pos[x][0] == "Left Tab" :
          t1_r_tab.append(t1_failure_pos[x][3])
        elif t1_failure_pos[x][0] == "Right Cage 1-4" :
          t1_l_one.append(t1_failure_pos[x][3])
        elif t1_failure_pos[x][0] == "Left Cage 1-4" :
          t1_r_one.append(t1_failure_pos[x][3])
        elif t1_failure_pos[x][0] == "Right Cage 5-8" :
          t1_l_five.append(t1_failure_pos[x][3])
        elif t1_failure_pos[x][0] == "Left Cage 5-8" :
          t1_r_five.append(t1_failure_pos[x][3])
        else :
          t1_general.append(t1_failure_pos[x][3])
      else :  
        if t1_failure_pos[x][0] == "Right Tab" :
          t1_l_tab_b.append(t1_failure_pos[x][3])
        elif t1_failure_pos[x][0] == "Left Tab" :
          t1_r_tab_b.append(t1_failure_pos[x][3])
        elif t1_failure_pos[x][0] == "Right Cage 1-4" :
          t1_l_one_b.append(t1_failure_pos[x][3])
        elif t1_failure_pos[x][0] == "Left Cage 1-4" :
          t1_r_one_b.append(t1_failure_pos[x][3])
        elif t1_failure_pos[x][0] == "Right Cage 5-8" :
          t1_l_five_b.append(t1_failure_pos[x][3])
        elif t1_failure_pos[x][0] == "Left Cage 5-8" :
          t1_r_five_b.append(t1_failure_pos[x][3])
        else :
          t1_general.append(t1_failure_pos[x][3])

  t1_total_failures.extend((t1_general, t1_l_five, t1_r_five, t1_l_one, t1_r_one, t1_l_tab, t1_r_tab, t1_l_five_b, t1_r_five_b, t1_l_one_b, t1_r_one_b, t1_l_tab_b, t1_r_tab_b))
  t1_max_fails = max(len(t1_r_tab), len(t1_l_tab), len(t1_r_one), len(t1_l_one), len(t1_r_five), len(t1_l_five), len(t1_r_tab_b), len(t1_l_tab_b), len(t1_r_one_b), len(t1_l_one_b), len(t1_r_five_b), len(t1_l_five_b))

  #If all the errors produced are located "General", then the length of t1_max_fails was producing a 0
  #We use t1_max_fails to size the circles on the pareto chart, so if this is zero, you get a divide by zero failure
  if t1_max_fails == 0:
    t1_max_fails = 1

  return (t1_total_failures, t1_max_fails)


def failure_pareto(cu1_accepted, t1_failure_pos) :
  yield_plot = yield_by_day(cu1_accepted, t1_failure_pos)

  organized_failures = organize_failure(t1_failure_pos)
  
  t1_fail_pos_leg = [] 
  t1_fail_pos_pct = [0]
  starts = []
  ends = []

  p_t1_fail_pos = figure(x_range=(0,6), y_range=(-6,6.25), title="Failure by Pos(Big Cirlce = More Prob)")
 
  #Draw the tabs and grid lines
  #rectangles for the tabs
  p_t1_fail_pos.quad(top=[-5,5.25], bottom=[-5.25,5], left=[.75,.75], right=[3.25,3.25], color="blue", alpha = .5)
  #lines defining the bottom of the grids
  p_t1_fail_pos.line(x=[.75,3.25], y=.25, color="blue") #Bottom of Top Grid
  p_t1_fail_pos.line(x=[.75,3.25], y=-.25, color="blue") #Bottom of Bottom Grid
  #Lines defining the left and right edges of the grid
  p_t1_fail_pos.line(x=.75, y=[.25,5.25], color="blue") 
  p_t1_fail_pos.line(x=.75, y=[-.25,-5.25], color="blue")
  p_t1_fail_pos.line(x=3.25, y=[.25,5.25], color="blue")
  p_t1_fail_pos.line(x=3.25, y=[-.25,-5.25], color="blue")

  #Draw the arrow for the belt direction  
  p_t1_fail_pos.line(x=[2,3], y=5.75, color="black")
  p_t1_fail_pos.line(x=[2.75,3], y=[6,5.75], color="black")
  p_t1_fail_pos.line(x=[2.75,3], y=[5.5, 5.75], color="black")

  #Spell BELT
  #B
  p_t1_fail_pos.line(x=.5, y=[5.5,6], color="black")
  p_t1_fail_pos.line(x=.75, y=[5.5,6], color="black")
  p_t1_fail_pos.line(x=[.5,.75], y=5.5, color="black")
  p_t1_fail_pos.line(x=[.5,.75], y=5.75, color="black")
  p_t1_fail_pos.line(x=[.5,.75], y=6, color="black")
  #E
  p_t1_fail_pos.line(x=.9, y=[6,5.5], color="black")
  p_t1_fail_pos.line(x=[.9,1.15], y=5.5, color="black")
  p_t1_fail_pos.line(x=[.9,1.15], y=5.75, color="black")
  p_t1_fail_pos.line(x=[.9,1.15], y=6, color="black")
  #L
  p_t1_fail_pos.line(x=1.3, y=[5.5, 6], color="black")
  p_t1_fail_pos.line(x=[1.3,1.55], y=5.5, color="black")
  #T
  p_t1_fail_pos.line(x=1.825, y=[5.5, 6], color="black")
  p_t1_fail_pos.line(x=[1.7,1.95], y=6, color="black")


  #Create the legend for the chart
  colors = choose_colors(organized_failures[0])[0]
  for legend,color in colors.iteritems() :
    p_t1_fail_pos.circle(x=0, y=0, radius=0, color=color, legend=legend)
  
  #Create all the wedges to make the chart
  for i in range(13) :
    if i == 0 :
      create_circle(5, 0, p_t1_fail_pos, organized_failures[0][i], .5, colors)
    if i == 1 :
      temp_radius = float(len(organized_failures[0][i]))/organized_failures[1]/2
      create_circle(1, 1, p_t1_fail_pos, organized_failures[0][i], temp_radius, colors)
    if i == 2 :
      temp_radius = float(len(organized_failures[0][i]))/organized_failures[1]/2
      create_circle(3, 1, p_t1_fail_pos, organized_failures[0][i], temp_radius, colors)
    if i == 3 :
      temp_radius = float(len(organized_failures[0][i]))/organized_failures[1]/2
      create_circle(1, 3, p_t1_fail_pos, organized_failures[0][i], temp_radius, colors)
    if i == 4 :
      temp_radius = float(len(organized_failures[0][i]))/organized_failures[1]/2
      create_circle(3, 3, p_t1_fail_pos, organized_failures[0][i], temp_radius, colors)
    if i == 5 :
      temp_radius = float(len(organized_failures[0][i]))/organized_failures[1]/2
      create_circle(1, 5, p_t1_fail_pos, organized_failures[0][i], temp_radius, colors)
    if i == 6 :
      temp_radius = float(len(organized_failures[0][i]))/organized_failures[1]/2
      create_circle(3, 5, p_t1_fail_pos, organized_failures[0][i], temp_radius, colors)
    if i == 7 :
      temp_radius = float(len(organized_failures[0][i]))/organized_failures[1]/2
      create_circle(3, -1, p_t1_fail_pos, organized_failures[0][i], temp_radius, colors)
    if i == 8 :
      temp_radius = float(len(organized_failures[0][i]))/organized_failures[1]/2
      create_circle(1, -1, p_t1_fail_pos, organized_failures[0][i], temp_radius, colors)
    if i == 9 :
      temp_radius = float(len(organized_failures[0][i]))/organized_failures[1]/2
      create_circle(3, -3, p_t1_fail_pos, organized_failures[0][i], temp_radius, colors)
    if i == 10 :
      temp_radius = float(len(organized_failures[0][i]))/organized_failures[1]/2
      create_circle(1, -3, p_t1_fail_pos, organized_failures[0][i], temp_radius, colors)
    if i == 11 :
      temp_radius = float(len(organized_failures[0][i]))/organized_failures[1]/2
      create_circle(3, -5, p_t1_fail_pos, organized_failures[0][i], temp_radius, colors)
    if i == 12 :
      temp_radius = float(len(organized_failures[0][i]))/organized_failures[1]/2
      create_circle(1, -5, p_t1_fail_pos, organized_failures[0][i], temp_radius, colors)

  return (p_t1_fail_pos, yield_plot)





def titrations(tit_meas, tit_tu, name, tit_color, y2_name) :
  tit_plot = figure(plot_width=500, plot_height=350, x_axis_type="datetime", x_axis_label = "Date", y_axis_label="Concentration (g/L)", tools = "pan,box_select,box_zoom,xwheel_zoom,reset,save,resize", background_fill = 'beige', title=name)

  #concentration, date, tool
  tit_x = []
  tit_y = []
  for i in tit_meas :
    tit_x.append(i[1])
    tit_y.append(float(i[0]))

  #Top Up Measurements
  tit_tu_x = []
  tit_tu_y = []
  tit_tu_max = 1
  for i in tit_tu :
    tit_tu_x.append(i[1])
    tit_tu_y.append(float(i[0]))
    if float(i[0]) > tit_tu_max :
      tit_tu_max = float(i[0])

  tit_plot.line(tit_x, tit_y, color=tit_color)
  tit_plot.extra_y_ranges = {y2_name: Range1d(start=0, end=tit_tu_max+10)}
  tit_plot.add_layout(LinearAxis(y_range_name=y2_name), 'right')
  tit_plot.circle(tit_tu_x,tit_tu_y, fill_color="white", size=8, y_range_name=y2_name, legend="Top Up Amount")

  return tit_plot



def create_histogram (mu, sigma, weights, bin_size, low_spec, high_spec, cu1_accepted, t1_failure_pos):
  p1 = figure(title="Normal Distribution",tools = "pan,box_select,box_zoom,xwheel_zoom,reset,save,resize", background_fill="#E8DDCB")

  measured = np.random.normal(mu, sigma, 1000)
  hist, edges = np.histogram(weights, density=True, bins=bin_size)

  x = np.linspace(np.amin(weights), np.amax(weights), 1000)
  pdf = 1/(sigma * np.sqrt(2*np.pi)) * np.exp(-(x-mu)**2 / (2*sigma**2))
  cdf = (1+scipy.special.erf((x-mu)/np.sqrt(2*sigma**2)))/2

  p1.quad(top=hist, bottom=0, left=edges[:-1], right=edges[1:],
       fill_color="#036564", line_color="#033649",\
  )

  sort_weights = sorted(weights)

  cu1_yield = round(float(len(cu1_accepted))/(float(len(cu1_accepted)) + float(len(t1_failure_pos))),2)

  p1.line(x, pdf, line_color="#D95B43", line_width=8, alpha=0.7, legend="PDF")
  p1.line(low_spec, y=[0, np.amax(hist)], line_dash=[4, 4], line_color="orange", line_width=3, alpha=.5)
  p1.line(high_spec, y=[0, np.amax(hist)], line_dash=[4, 4], line_color="orange", line_width=3, alpha=.5)
  p1.line(weights[0], 0, line_width=1, legend='Mean = ' + str(round(mu, 3))) #daily rejected
  p1.line(weights[0], 0, line_width=1, legend='2*Std (Std = ' + str(round(sigma, 3)) + ")") #daily accepted
  p1.line(weights[0], 0, line_width=1, legend='Yield: ' + str(cu1_yield)) #daily rejected
  p1.line(weights[0], 0, line_width=1, legend='Accepted: ' + str(len(cu1_accepted))) #daily accepted
  p1.line(weights[0], 0, line_width=1, legend='Rejected: ' + str(len(t1_failure_pos))) #daily rejected

  p1.xaxis.bounds = (np.amin(weights), np.amax(weights))

  p1.legend.orientation = "top_left"
  p1.xaxis.axis_label = 'Weight (g)'
  p1.yaxis.axis_label = 'Pr(x)'
  return p1



def thickness_uniformity(c_thickness_stats, l_thickness_stats, r_thickness_stats, cu1_measured, cu1_accepted, meco_c_thickness, cl):
  p4a = figure(plot_width=700, plot_height=400, title="Meco Thickness Comparison")

  c_measurements = [1,2,3,4,5,6,7,8]
  l_measurements = [1,5,8]
  r_measurements = [1,5,8]

  #Center thickness
  p4a.line(c_measurements, c_thickness_stats, line_width=2, legend='Center')
  p4a.circle(c_measurements, c_thickness_stats, fill_color='white', size=8)
  #Left thickness
  p4a.line(l_measurements, l_thickness_stats, line_width=2, legend='Left', color='orange')
  p4a.circle(l_measurements, l_thickness_stats, fill_color='white', size=8)
  #Right thickness
  p4a.line(r_measurements, r_thickness_stats, line_width=2, legend='Right', color='purple')
  p4a.circle(r_measurements, r_thickness_stats, fill_color='white', size=8)
  #Total number of measured grids
  p4a.line(c_measurements, c_thickness_stats, line_width=2, legend='Total Measured: ' + str(cu1_measured), color='green')
  #Sampling Percentage
  p4a.line(c_measurements, c_thickness_stats, line_width=2, legend='Total Accepted: ' + str(len(cu1_accepted)), color='green')

  p4a.xaxis.axis_label = 'Measurement Number'
  p4a.yaxis.axis_label = 'Thickness (mm)'

  #Normalize Center Thicknesses
  normalized_thickness = statfunctions.normalize(meco_c_thickness)
  n_thickness_stats = statfunctions.liststats(normalized_thickness, cl)

  p4b = figure(plot_width=700, plot_height=400, title="Center Thickness Control (Normalized)")
  p4b.line(c_measurements, n_thickness_stats['avg'], line_width=2, legend='Center')
  p4b.circle(c_measurements, n_thickness_stats['avg'], fill_color='white', size=8)
  #STD lines
  p4b.line(c_measurements, n_thickness_stats['ucl'], line_width=1, line_color='red', legend='2 Std Lines')
  p4b.line(c_measurements, n_thickness_stats['lcl'], line_width=1, line_color='red')
  p4b.xaxis.axis_label = 'Measurement Number'
  p4b.yaxis.axis_label = 'Thickness (mm)'

  return (p4a, p4b)