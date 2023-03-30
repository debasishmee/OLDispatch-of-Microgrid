import os
import sys
from time import sleep
from datetime import datetime
import random
import argparse

from google.cloud import firestore                      # sudo pip install google.cloud
import firebase_admin                                   # sudo pip install firebase-admin
from firebase_admin import credentials
from firebase_admin import firestore

credentials_path = 'D:\AngularFirebase\OLdispatch-of-Microgrid\_pythonSensor\OLdispatch-of-Microgrid.json'
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path

cred = credentials.Certificate(credentials_path)
firebase_admin.initialize_app(cred)

COLLECTION_NAME = u'Mydata1'

def build_historic_doc_name():
    date = datetime.today().strftime('%Y_%m_%d')        # ex: '2021_05_13'
    hour = datetime.today().strftime('%H')
    return f'{date}_h{hour}'
    
def parse_args():
    parser = argparse.ArgumentParser(description='Sensor simulator!')
    # parser.add_argument('-o','--once', action='store_true', help='Simulate sensor simulation s...once')         # doesn't take in a value (stores as True/False)
    parser.add_argument('-c','--count', default=20, type=int, help='Count of sensor simulations to run')
    parser.add_argument('-p','--pause', default=5.0, type=float, help='Pause in seconds between sensor simulations')
    args = vars(parser.parse_args())
    return args

if __name__ == '__main__':
    args = parse_args()
    simulation_count = args['count']                        # how many simulations to run
    sleep_time = args['pause']                              # how long to sleep between runs in milliseconds
    
    print(f'sleep time: {sleep_time}')
    print(f'simulating {simulation_count} reads')

    db = firestore.Client()

                       # [a, b], start the humidity at some random value
    Generation_grid_max_delta = 10

    for x in range(simulation_count):
        doc_current = 'current';                       # only storing the current sensor readings
        doc_historic = build_historic_doc_name();      # storing an array of all sensor readings for the time bucket

       # Generation_grid = random.randint(max(0, Generation_grid - Generation_grid_max_delta), min(100, Generation_grid + Generation_grid_max_delta))                    # [a, b]
        if x <= 10: # total requirement 120-150
            Dispatch_grid = random.randint(120, 160)
            Generation_grid = random.randint(100,200) 

            Generation_PV = random.randint(2, 10)
            Dispatch_PV = random.randint(40, 50)

            Generation_Wind = random.randint(60, 80)
            Dispatch_Wind = random.randint(60, 80)
        elif x > 10 and x <=20:
            Dispatch_grid = random.randint(60, 80)
            Generation_grid = random.randint(100,200) 

            Generation_PV = random.randint(50, 60)
            Dispatch_PV = random.randint(70, 80)

            Generation_Wind = random.randint(60, 80)
            Dispatch_Wind = random.randint(60, 80)
        else: 
            Dispatch_grid = random.randint(160, 180) # total requirement 160-180
            Generation_grid = random.randint(100,200) 

            Generation_PV = random.randint(2, 10)
            Dispatch_PV = random.randint(40, 50)

            Generation_Wind = random.randint(60, 80)
            Dispatch_Wind = random.randint(60, 80)

        print(f'Generation-grid: {Generation_grid}, Dispatch-grid: {Dispatch_grid}')

        data = {
            u'Generation_grid': Generation_grid,
            u'Dispatch_grid': Dispatch_grid,
            u'Generation_PV': Generation_PV,
            u'Dispatch_PV': Dispatch_PV,
            u'Generation_Wind': Generation_Wind,
            u'Dispatch_Wind': Dispatch_Wind,

            u'timestamp': datetime.utcnow(),                # use utcnow() instead of now(), otherwise the timezone offset will be applied twice
            # u'timestamp': firestore.SERVER_TIMESTAMP
        }
        doc_ref = db.collection(COLLECTION_NAME).document(doc_current)
        doc_ref.set(data)

        data = {
            u'historicalMeasurements': firestore.ArrayUnion( [{ 
                u'Generation_grid': Generation_grid,
                u'Dispatch_grid': Dispatch_grid,
                u'Generation_PV': Generation_PV,
                u'Dispatch_PV': Dispatch_PV,
                u'Generation_Wind': Generation_Wind,
                u'Dispatch_Wind': Dispatch_Wind,
                u'timestamp': datetime.utcnow(),                # use utcnow() instead of now(), otherwise the timezone offset will be applied twice
                # u'timestamp': firestore.SERVER_TIMESTAMP
            }] )
        }
        doc_ref = db.collection(COLLECTION_NAME).document(doc_historic)
        doc_ref.set(data, merge=True)

        if simulation_count == 1:                           # don't pause when there's a single simulation to run
            sys.exit(0)

        sleep(sleep_time)
