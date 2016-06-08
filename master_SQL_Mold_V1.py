#!C:\Users\arvind.chari\Documents\NewGitTest\Anaconda\python.exe -u
#!/usr/bin/env python

#GTAT Grid Production Line Bokeh Plotting Software
#Started By Kevin Zhai during Summer 2015 internship
#Continuted by Arvind Chari
#Modified: 1/1/16
#Use with the Bokeh Plotting Software Guide
#VPS 1 OS: Linux
#IP address: 64.50.187.242
#Username: root (SSH)
#Password: 0DZ5Mn35eFar
##############################################################################
#I. Importing
##############################################################################

#User Generated Classes
import statfunctions
import graph_functions

#Classes Imported from the standard Library
from numpy import pi
import pandas as pd
import sys
import datetime
from bokeh.plotting import figure, gridplot, hplot
from bokeh.io import output_file, show
from bokeh.models import Callback, GlyphRenderer, Circle, HoverTool, Range1d, LinearAxis
from bokeh.models.widgets import Panel, Tabs
from bokeh.charts import Bar, Histogram
import sqlalchemy as sa
import pyodbc
from collections import Counter
from random import randint
import getpass
import inspect, os #Modules used to get the directory and then create a place to store the generated files

##############################################################################
#II.Connecting to the Database
##############################################################################
while True:  
  try:
    p = getpass.getpass()
    cnxn = pyodbc.connect('DRIVER={SQL Server};SERVER=GTAT-PC\SQLExpress, 1433;DATABASE=GTAT_GRIDS;UID=db1_readonly;PWD=' + p)
    break
  except pyodbc.Error:
    print "Wrong Password, try again..."

print "Correct Password! Processing your results..."
cursor = cnxn.cursor()
#Fetch the start and end dates from the user input
#Assign these dates to variables to use later
first = sys.argv[1]
last = sys.argv[2]
first_bt = sys.argv[3]
last_bt = sys.argv[4]
first_mandrel = sys.argv[5]
last_mandrel = sys.argv[6]


##############################################################################
#III.Fetch Data from the Database
##############################################################################

#############################################################################
#MECO Tool 1 Copper Data

cu1_accepted = [] #A list of datetimes for the grids accepted. The length of the list is the # of accepted grids. Uses datetimes to find the yield/day

cu1_id = []
cu1_idx = []
cu1_tool = []
cu1_weight = []

#Thickness for all the center, left, and right points on a grid. A list of lists
cu1_measured = 0 #The number of grids sampled by the thickness check
meco_c_thickness = [] 
meco_l_thickness = []
meco_r_thickness = []

#For each grid which fails, keep a list of the position and reason for the failure
#The length of this list tells you how many failures you had
t1_failure_pos = [] #A list of lists of failure positions e.g. ((Left cage 5-8, A, Datetm, Broken), (Left Cage 1-4, B, Datetm, Alignment Failure))

bad_outputs = [] #If rejected out of all error checks, what is the ID we need to find
mandrel_ids = [] #A list of mandrel_ids in order to get usage counts later
bad_run = []

#LIST OF THE QUERY OUTPUTS IN ORDER (How to find a variable from row[x])
#0-rd_weight,
#1-rd_gridid, 
#2-rd_leftmidcage1, 
#3-rd_topthirdcage1, 
#4-rd_rightmidcage1, 
#5-rd_topthirdcage2, 
#6-rd_topthirdcage3, 
#7-rd_topthirdcage4, 
#8-rd_leftmidcage5, 
#9-rd_midcage5, 
#10-rd_rightmidcage5, 
#11-rd_midcage6, 
#12-rd_midcage7, 
#13-rd_leftmidcage8,
#14-rd_midcage8,
#15-rd_rightmidcage8,
#16-rd_idx, 
#17-rd_runno, 
#18-rd_failureposition, 
#19-rd_rejectreason, 
#20-rd_sample, 
#21-rd_gridpos, 
#22-rd_datetm, 

cursor.execute("select rd_weight,rd_gridid, rd_leftmidcage1, rd_topthirdcage1, rd_rightmidcage1, rd_topthirdcage2, rd_topthirdcage3, rd_topthirdcage4, rd_leftmidcage5, rd_midcage5, rd_rightmidcage5, rd_midcage6, rd_midcage7, rd_leftmidcage8, rd_midcage8, rd_rightmidcage8,rd_idx, rd_runno, rd_failureposition, rd_rejectreason, rd_sample, rd_gridpos, rd_datetm, rd_mandrelid from rundtl where rd_toolno = 'Tool 1' and rd_datetm >= ? and rd_datetm <= ? order by rd_datetm desc", (first, last))
rows = cursor.fetchall()
#rows contains all the results of the search. Iterate through it to get every result that the above query found
for row in rows :
  #If there is no weight entered, then consider it a failure
  #If the grid is a failure, then where did the failure occur and what type of failure is it?
  if row[0] == None : 
    #If there is a reject reason and position
    if row[18] != None and row[18] != "" and row[19] != None and row[19] != "":
      t1_failure_pos.append((row[18],row[21], row[22], row[19]))
    #If there is only a reject position but no reason
    elif row[18] != None and row[18] != "" :
      t1_failure_pos.append((row[18],row[21], row[22], "General"))
    #If there is only a reason and no position
    elif row[19] != None and row[19] != "" :
      t1_failure_pos.append(("General", row[21], row[22], row[19]))
    #If there is neither a reason nor a position
    else :
      t1_failure_pos.append(("General", row[21], row[22], "General"))
  #Now, if there is a weight entered for the grid, we want to graph it
  else :
    #There is a weird thing with numbers from sql database. in order to make them floats, you must add them to a list as a float. Otherwise they throw an error
    output = []
    output.append(float(row[0]))
    #Check to make sure the weight is a float
    if isinstance(output[0], float) :
      cu1_idx.append(row[16])
      #Create a list of grid ID's associated with the run numbers for the grids that passed
      cu1_id.append(row[1]) 
      cu1_tool.append(1)
      cu1_weight.append(output[0])
      if output[0] > 5:
        bad_outputs.append((row[1], row[0], 'Tool 1'))

      #Check if ther is a thickness sample taken. If it is, check each value exists before adding it to the graph
      #row[20]=1 indicates if the sample was taken
      if row[20] == 1 :
        meco_center_list = []
        meco_left_list = []
        meco_right_list = []
        cu1_measured += 1
        output_thickness = []
        if row[2] != None :
          output_thickness.append(float(row[2]))
          meco_left_list.append(output_thickness[0])
        else :
          output_thickness.append(.1)
          meco_left_list.append(.1)
        if row[3] != None :
          output_thickness.append(float(row[3]))
          meco_center_list.append(output_thickness[1])
        else :
          output_thickness.append(.1)
          meco_center_list.append(.1)
        if row[4] != None :
          output_thickness.append(float(row[4]))
          meco_right_list.append(output_thickness[2])
        else :
          output_thickness.append(.1)
          meco_right_list.append(.1)
        if row[5] != None :
          output_thickness.append(float(row[5]))
          meco_center_list.append(output_thickness[3])
        else :
          output_thickness.append(.1)
          meco_center_list.append(.1)
        if row[6] != None :
          output_thickness.append(float(row[6]))
          meco_center_list.append(output_thickness[4])
        else :
          output_thickness.append(.1)
          meco_center_list.append(.1)
        if row[7] != None :
          output_thickness.append(float(row[7]))
          meco_center_list.append(output_thickness[5])
        else :
          output_thickness.append(.1)
          meco_center_list.append(.1)
        if row[8] != None :
          output_thickness.append(float(row[8]))
          meco_left_list.append(output_thickness[6])
        else :
          output_thickness.append(.1)
          meco_left_list.append(.1)
        if row[9] != None :
          output_thickness.append(float(row[9]))
          meco_center_list.append(output_thickness[7])
        else :
          output_thickness.append(.1)
          meco_center_list.append(.1)
        if row[10] != None :
          output_thickness.append(float(row[10]))
          meco_right_list.append(output_thickness[8])
        else :
          output_thickness.append(.1)
          meco_right_list.append(.1)
        if row[11] != None :
          output_thickness.append(float(row[11]))
          meco_center_list.append(output_thickness[9])
        else :
          output_thickness.append(.1)
          meco_center_list.append(.1)
        if row[12] != None :
          output_thickness.append(float(row[12]))
          meco_center_list.append(output_thickness[10])
        else :
          output_thickness.append(.1)
          meco_center_list.append(.1)
        if row[13] != None :
          output_thickness.append(float(row[13]))
          meco_left_list.append(output_thickness[11])
        else :
          output_thickness.append(.1)
          meco_left_list.append(.1)
        if row[14] != None :
          output_thickness.append(float(row[14]))
          meco_center_list.append(output_thickness[12])
        else :
          output_thickness.append(.1)
          meco_center_list.append(.1)
        if row[15] != None :
          output_thickness.append(float(row[15]))
          meco_right_list.append(output_thickness[13])
        else :
          output_thickness.append(.1)
          meco_right_list.append(.1)

        meco_c_thickness.append(meco_center_list)
        meco_l_thickness.append(meco_left_list)
        meco_r_thickness.append(meco_right_list)
 
      if output[0] > 1.61 :
        #The weight is outside of the spec, it is too high
        t1_failure_pos.append(("General", row[21], row[22], "Copper Weight Too High"))
      else :
        #If There is a weight, it is below 1.61, then it is accepted
        cu1_accepted.append(row[22])
    else :
      #cu1_rejected.append(row[22])
      t1_failure_pos.append(("General", row[21], row[22], "Weight is not a Number"))

#############################################################################
#Meco Tool 2 Sn/Pb Data


cu2_accepted = []

cu2_id = []
cu2_idx = []
cu2_tool = []
cu2_weight = []

sn_thickness_y = []
sn_thickness_x = [] 
sn_pct_y = []
sn_pct_x = []

t2_failure_pos = [] #What is the failure Position for the tool 2 grids

#LIST OF THE QUERY OUTPUTS IN ORDER (How to find a variable from row[x])
#0-rd_weight,
#1-rd_weight2,
#2-rd_gridid
#3-rd_idx
#4-rd_runno
#5-rd_failureposition
#6-rd_rejectreason
#7-rd_tableftsn 
#8-rd_tabcentersn 
#9-rd_tabrightsn 
#10-rd_tableftthickness
#11-rd_tabcenterthickness
#12-rd_tabrightthickness 
#13-rd_datetm
#14-rd_sample
#15-rd_gridpos

cursor.execute("select rd_weight,rd_weight2,rd_gridid,rd_idx,rd_runno,rd_failureposition, rd_rejectreason, rd_tableftsn, rd_tabcentersn, rd_tabrightsn,rd_tableftthickness, rd_tabcenterthickness, rd_tabrightthickness, rd_datetm, rd_sample, rd_gridpos from rundtl where rd_toolno = 'Tool 2' and rd_datetm >= ? and rd_datetm <= ? order by rd_datetm desc", (first, last))
rows_T2 = cursor.fetchall()
for row in rows_T2 :
  if row[14] == 1 :
    if row[7] != None and row[7] != "":
      sn_pct_x.append(row[13])
      if row[8] != None and row[8] != "" and row[9] != None and row[9] != "":
        sn_pct_y.append((float(row[7]),float(row[8]),float(row[9])))
      elif row[8] != None and row[8] != "":
        sn_pct_y.append((float(row[7]),float(row[8]),-1))
      elif row[9] != None and row[9] != "":
        sn_pct_y.append((float(row[7]),-1,float(row[9])))
      else:
        sn_pct_y.append((float(row[7]),-1,-1))
    if row[10] != None and row[10] != "":
      sn_thickness_x.append(row[13])
      if row[11] != None and row[11] != "" and row[12] != None and row[12] != "":
        sn_thickness_y.append((float(row[10]),float(row[11]),float(row[12])))
      elif row[11] != None and row[11] != "":
        sn_thickness_y.append((float(row[10]),float(row[11]),-1))
      elif row[12] != None and row[12] != "":
        sn_thickness_y.append((float(row[10]),-1,float(row[12])))
      else:
        sn_thickness_y.append((float(row[10]),-1,-1))
  if row[5] != "" or row[6] != "" :
    #cu2_rejected.append(row[13])
    if row[5] != None and row[5] != "" and row[6] != None and row[6] != "":
      t2_failure_pos.append((row[5], row[15][-1:], row[13],row[6])) #The use of [:-1] means take the last digit from the result. For something like 13A, it will result in only A
    elif row[5] != None and row[5] != "":
      t2_failure_pos.append((row[5], row[15][-1:], row[13], "General"))
    elif row[6] != None and row[6] != "":
      t2_failure_pos.append(("General", row[15][-1:], row[13],row[6]))
    else :
      t2_failure_pos.append(("General", row[15][-1:], row[13], "General"))
  else :
    output2 = []
    output3 = []
    if statfunctions.is_number(row[0]) and statfunctions.is_number(row[1]):
      output2.append(float(row[0]))
      output3.append(float(row[1]))
      net_weight = output2[0] - output3[0]
      if output2[0] > 5:
        bad_outputs.append((row[2], row[0], 'Tool 2'))

      #if isinstance(net_weight, float) :
      #if(net_weight > 0 and net_weight < .7) :
      cu2_id.append((row[2],row[4]))
      cu2_idx.append(row[3]) #Changed this line of code to take in the grid ID. Should be careful what this change did tomorrow
      cu2_tool.append(2)
      cu2_weight.append(net_weight)
      if net_weight > .55 :
        #cu2_rejected.append(row[13])
        t2_failure_pos.append(("General", row[15][-1:], row[13], "Sn/Pb Weight Too High")) #If the grid is too heavy, note that, but still input the position (A, B, C, D)->row15(the -1 means the last digit), and the date in datetime format
      elif net_weight < .2 :
        #cu2_rejected.append(row[13])
        t2_failure_pos.append(("General", row[15][-1:], row[13], "Sn/Pb Weight Too Low"))
      else :
        cu2_accepted.append(row[13])
    else :
      #cu2_rejected.append(row[13])
      t2_failure_pos.append(("General", row[15][-1:], row[13], "No Tool 1 Weight"))
      bad_outputs.append((row[2], row[0], row[1]))


#############################################################################
#Bath Titration Data


#Copper Information
copper_sulfate = []
sulfuric_acid = []
hcl = []
cu_acid_clean = []

copper_sulfate_tu = []
sulfuric_acid_tu = []
hcl_tu = []
cu_acid_clean_tu = []

#Sn/Pb Information
tin = []
pb = []
sn_additive = []
predip = []
msa = []

tin_tu = []
pb_tu = []
sn_additive_tu = []
predip_tu = []
msa_tu = []

#Error Check
catch_error = []
catch_error_tu = []

cursor.execute("select dttm,toolno,measurable,concentration,topupamount,units from BathTitrations where dttm >= ? and dttm <= ? order by dttm asc", (first_bt, last_bt))
rows_BT = cursor.fetchall()
for row in rows_BT :
  if row[1] == 'Tool 1' :
    #Check if there is anything to add to the bath titrations for Tool 1
    if row[3] != None and row[3] != 0:
      if row[2] == 'Sulfuric Acid (90-110 g/L)' :
        sulfuric_acid.append((row[3],row[0],row[1]))
      elif row[2] == 'Acid Clean (7-13%)' :
        cu_acid_clean.append((row[3],row[0],row[1]))
      elif row[2] == 'Chloride Ions (60-100 mg/L)' :
        hcl.append((row[3],row[0],row[1]))
      elif row[2] == 'Copper Sulfate (175-220 g/L)' :
        copper_sulfate.append((row[3],row[0],row[1]))
      else :
        catch_error.append((row[3],row[0],row[1]))

    #Check if there is anything to add to the top up for Tool 1
    if row[4] != None and row[4] != 0:
      if row[2] == 'Sulfuric Acid (90-110 g/L)' :       
        sulfuric_acid_tu.append((row[4],row[0], row[1]))
      elif row[2] == 'Acid Clean (7-13%)' :
        cu_acid_clean_tu.append((row[4],row[0], row[1]))
      elif row[2] == 'Chloride Ions (60-100 mg/L)' :
        hcl_tu.append((row[4],row[0], row[1]))
      elif row[2] == 'Copper Sulfate (175-220 g/L)' :
        copper_sulfate_tu.append((row[4],row[0], row[1]))
      else :
        catch_error_tu.append((row[4],row[0], row[1]))

  else :
    #Check if there is anything to add to the bath titrations for Tool 2
    if row[3] != None and row[3] != 0:
      if row[2] == 'Tin (53-60 g/L)':
        tin.append((row[3],row[0],row[1]))
      elif row[2] == 'Pb (14-16 g/L)':
        pb.append((row[3],row[0],row[1]))
      elif row[2] == 'Additive (90-110 g/L)':
        sn_additive.append((row[3],row[0],row[1]))
      elif row[2] == 'Pre-Dip (175-225 g/L)':
        predip.append((row[3],row[0],row[1]))
      elif row[2] == 'Acid (200-300 g/L)':
        msa.append((row[3],row[0],row[1]))
      else:
        catch_error.append((row[3],row[0],row[1]))

    #Check if there is anything to add to the top up for tool 2
    if row[4] != None and row[4] != 0:
      if row[2] == 'Tin (53-60 g/L)':
        tin_tu.append((row[4],row[0], row[1]))
      elif row[2] == 'Pb (14-16 g/L)':
        pb_tu.append((row[4],row[0], row[1]))
      elif row[2] == 'Additive (90-110 g/L)':
        sn_additive_tu.append((row[4],row[0], row[1]))
      elif row[2] == 'Pre-Dip (175-225 g/L)':
        predip_tu.append((row[4],row[0], row[1]))
      elif row[2] == 'Acid (200-300 g/L)':
        msa_tu.append((row[4],row[0], row[1]))
      else:
        catch_error_tu.append((row[4],row[0], row[1]))


#############################################################################
#Fetch Resistivity Data

res_x = []
res_y = []
cursor.execute("select dttm,result from Resistivity where dttm >= ? and dttm <= ? order by dttm asc", (first_bt, last_bt))
rows_res = cursor.fetchall()
for row in rows_res :
  if row[1] != None and row[1] != 0:
    res_x.append(row[0])
    res_y.append(float(row[1]))


#############################################################################
#Fetch Mandrel Data from PCB Master

cursor.execute("select rd_weight, rd_failureposition, rd_rejectreason, rd_datetm, rd_mandrelid from rundtl where rd_toolno = 'Tool 1' and rd_datetm >= ? and rd_datetm <= ? order by rd_datetm desc", (first_mandrel, last_mandrel))
rows = cursor.fetchall()
for row in rows :
  if row[4] != None:
    mandrel_ids.append(row[4]) #, row[0], row[1], row[2], row[3]])

######################################################################################
#III. Start Bokeh Plotting
######################################################################################
file_folder = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe()))) + '\\html_archive\\' #Finds the absolute file path of the 

if first == last:
	output_file(first + '.html', title=first)
else:
	output_file(file_folder + first + ' to ' + last + '.html', title=first + ' to ' + last)

cl = 2 #control limit multiplier

#FOR ALL OF THE FOLLOWING GRAPHS, functions were created in graph_functions.py to avoid writing the code multiple times 
######################################################################################
#Cu1 Plot
cu1_stats = statfunctions.stats(cu1_weight, cl)
p1 = graph_functions.create_histogram(cu1_stats['avg'], cu1_stats['std'], cu1_weight, 50, 1.2, 1.6, cu1_accepted, t1_failure_pos)

######################################################################################
#Cu2 Plot
cu2_stats = statfunctions.stats(cu2_weight, cl)
p2 = graph_functions.create_histogram(cu2_stats['avg'], cu2_stats['std'], cu2_weight, 50, .2, .55, cu2_accepted, t2_failure_pos)

######################################################################################
#Meco GridThicknesses
######################################################################################
#p3 = graph_functions.thickness_uniformity(statfunctions.liststats(meco_c_thickness, cl)['avg'], statfunctions.liststats(meco_l_thickness, cl)['avg'], statfunctions.liststats(meco_r_thickness, cl)['avg'], cu1_measured, cu1_accepted, meco_c_thickness, cl)[0]

c_thickness_stats = statfunctions.liststats(meco_c_thickness, cl)
l_thickness_stats = statfunctions.liststats(meco_l_thickness, cl)
r_thickness_stats = statfunctions.liststats(meco_r_thickness, cl)

p4a = figure(plot_width=700, plot_height=400, title="Meco Thickness Comparison")
c_measurements = [1,2,3,4,5,6,7,8]
l_measurements = [1,5,8]
r_measurements = [1,5,8]
#Center thickness
p4a.line(c_measurements, c_thickness_stats['avg'], line_width=2, legend='Center')
p4a.circle(c_measurements, c_thickness_stats['avg'], fill_color='white', size=8)
#Left thickness
p4a.line(l_measurements, l_thickness_stats['avg'], line_width=2, legend='Left', color='orange')
p4a.circle(l_measurements, l_thickness_stats['avg'], fill_color='white', size=8)
#Right thickness
p4a.line(r_measurements, r_thickness_stats['avg'], line_width=2, legend='Right', color='purple')
p4a.circle(r_measurements, r_thickness_stats['avg'], fill_color='white', size=8)
#Total number of measured grids
p4a.line(c_measurements, c_thickness_stats['avg'], line_width=2, legend='Total Measured: ' + str(cu1_measured), color='green')
#Sampling Percentage
p4a.line(c_measurements, c_thickness_stats['avg'], line_width=2, legend='Total Accepted: ' + str(len(cu1_accepted)), color='green')

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

##################################################################
#Bath Titrations Tool 1 Plot
p_bt1_sul = graph_functions.titrations(sulfuric_acid, sulfuric_acid_tu, "Sulfuric Acid (90-110 g/L)", "green", "top_up_cu")
p_bt1_cu = graph_functions.titrations(copper_sulfate, copper_sulfate_tu, "Copper Sulfate (175-220 g/L)", "blue", "top_up_sul")
p_bt1_hcl = graph_functions.titrations(hcl, hcl_tu, "HCl (60-100 mg/L)", "red", "top_up_hcl")
p_bt1_acid = graph_functions.titrations(cu_acid_clean, cu_acid_clean_tu, "Acid Clean (7-13%)", "orange", "top_up_acid")

##################################################################
#Bath Titrations Tool 2 Plot
p_bt2_tin = graph_functions.titrations(tin, tin_tu, "Tin (53-60 g/L)", "blue", "top_up_tin")
p_bt2_pb = graph_functions.titrations(pb, pb_tu, "Pb (14-16 g/L)", "green", "top_up_pb")
p_bt2_sn_additive = graph_functions.titrations(sn_additive, sn_additive_tu, "Additive (90-110 g/L)", "red", "top_up_sn_additive")
p_bt2_acid = graph_functions.titrations(msa, msa_tu , "MSA Acid (200-300 g/L)", "black", "top_up_msa_acid")
p_bt2_predip= graph_functions.titrations(predip, predip_tu, "Acid Predip (175-225 g/L)", "orange", "top_up_predip")

##################################################################
#Copper Resistivity Measurements
p_res = figure(plot_width=650, plot_height=500, x_axis_type="datetime", x_axis_label = "Date", y_axis_label="Resistibity (uohm-cm)", tools = "pan,box_select,box_zoom,xwheel_zoom,reset,save,resize", background_fill = 'beige', title="Resistivity")
p_res.circle(res_x, res_y, fill_color="white", size=8)

res_stats = statfunctions.stats(res_y, cl)

p_res.line(res_x, res_stats['avg'], line_width=2, line_color='red', line_dash=[4,4], legend='Mean = ' + str(round(res_stats['avg'], 3)))
p_res.line(res_x, res_stats['avg']+2*res_stats['std'], line_width=1, line_color='red', legend='2*Std (Std = ' + str(round(res_stats['std'], 3)) + ")")
p_res.line(res_x, res_stats['avg']-2*res_stats['std'], line_width=1, line_color='red')

##################################################################
#Tin Lead Thickness and Percentages
sn_thickness_stats = statfunctions.liststats(sn_thickness_y, cl)
sn_pct_stats = statfunctions.liststats(sn_pct_y, cl)

p_sn_pct = figure(plot_width=650, plot_height=500, x_axis_type="datetime", x_axis_label = "Date", y_axis_label="Sn Percentage", tools = "pan,box_select,box_zoom,xwheel_zoom,reset,save,resize", background_fill = 'beige', title="Tin Percentage")
p_sn_thickness = figure(plot_width=650, plot_height=500, x_axis_type="datetime", x_axis_label = "Date", y_axis_label="Sn Thickness", tools = "pan,box_select,box_zoom,xwheel_zoom,reset,save,resize", background_fill = 'beige', title="Tin Lead Thickness")

if len(sn_pct_x) > 0:
  p_sn_pct.circle(sn_pct_x, sn_pct_stats['avg'], fill_color="white", size=8)

if len(sn_thickness_x) > 0:
  p_sn_thickness.circle(sn_thickness_x, sn_thickness_stats['avg'], fill_color="white", size=8)

##################################################################
#Tool 1 and 2 Paretos
p_t1_fail_pos = graph_functions.failure_pareto(cu1_accepted, t1_failure_pos)
p_t2_fail_pos = graph_functions.failure_pareto(cu2_accepted, t2_failure_pos)

##################################################################
#Mandrel Uses BoxPlot
if len(mandrel_ids) > 0:
  mandrel_uses = []
  mandrel_uses.append(Counter(mandrel_ids).keys())  
  mandrel_uses.append(Counter(mandrel_ids).values())
  mandrel_uses[1][:] = [x/4 for x in mandrel_uses[1]]
  mold_reuse = Histogram(mandrel_uses[1], width=500, height=500, bins=3, xlabel = "Number of Uses", tools = "pan,box_select,box_zoom,xwheel_zoom,reset,save,resize", title="# of Uses vs Count", density=False)
##################################################################
#Create Panel layout
##################################################################
  tab1 = Panel(child=gridplot([[p1, p_t1_fail_pos[0]], [p4a, p_t1_fail_pos[1]]]), title="MECO Tool 1 Weights") #first tab of the dashboard
  tab2 = Panel(child=gridplot([[p2, p_t2_fail_pos[0]],[p_t2_fail_pos[1],p_sn_thickness]]), title="MECO Tool 2 Data") #second tab of the dashboard
  tab4 = Panel(child=gridplot([[p_bt1_sul, p_bt1_cu], [p_bt1_hcl, p_bt1_acid]]), title="Bath Titrations Tool 1")
  tab5 = Panel(child=gridplot([[p_bt2_tin, p_bt2_pb, p_bt2_sn_additive], [p_bt2_acid, p_bt2_predip, None]]), title="Bath Titrations Tool 2")
  tab6 = Panel(child=hplot(p_res), title="Resistivity")
  tab7 = Panel(child=hplot(mold_reuse), title="Mandrel Data")

  tabs = Tabs(tabs=[tab1, tab2, tab4, tab5, tab6, tab7])
else:
  tab1 = Panel(child=gridplot([[p1, p_t1_fail_pos[0]], [p4a, p_t1_fail_pos[1]]]), title="MECO Tool 1 Weights") #first tab of the dashboard
  tab2 = Panel(child=gridplot([[p2, p_t2_fail_pos[0]],[p_t2_fail_pos[1],p_sn_thickness]]), title="MECO Tool 2 Data") #second tab of the dashboard
  tab4 = Panel(child=gridplot([[p_bt1_sul, p_bt1_cu], [p_bt1_hcl, p_bt1_acid]]), title="Bath Titrations Tool 1")
  tab5 = Panel(child=gridplot([[p_bt2_tin, p_bt2_pb, p_bt2_sn_additive], [p_bt2_acid, p_bt2_predip, None]]), title="Bath Titrations Tool 2")
  tab6 = Panel(child=hplot(p_res), title="Resistivity")

  tabs = Tabs(tabs=[tab1, tab2, tab4, tab5, tab6])

show(tabs)