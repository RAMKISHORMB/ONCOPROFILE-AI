import sys
import time
import threading
import urllib.request
import json

sys.path.insert(0, 'backend')
import uvicorn
from app.main import app

def run_tests():
    config = uvicorn.Config(app, host='127.0.0.1', port=8000, log_level='warning')
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run)
    thread.daemon = True
    thread.start()
    time.sleep(2)

    # 1. Health
    r = urllib.request.urlopen('http://127.0.0.1:8000/api/health')
    health = json.loads(r.read())
    print("[TEST 1/5] Health:", health['status'])

    # 2. Dashboard
    r = urllib.request.urlopen('http://127.0.0.1:8000/api/dashboard')
    dash = json.loads(r.read())
    print(f"[TEST 2/5] Total Patients: {dash['total_patients']}, Subtypes: {list(dash['subtype_distribution'].keys())}")

    # 3. Model Performance
    r = urllib.request.urlopen('http://127.0.0.1:8000/api/model/performance')
    perf = json.loads(r.read())
    print(f"[TEST 3/5] Model Accuracy: {perf['accuracy']*100:.1f}%, Macro F1: {perf['f1_macro']:.3f}")

    # 4. Patient ONC-001 Analysis
    req = urllib.request.Request('http://127.0.0.1:8000/api/analyze/ONC-001', data=b'', method='POST')
    r = urllib.request.urlopen(req)
    an = json.loads(r.read())
    print(f"[TEST 4/5] ONC-001 Analysis:")
    print(f"           - Subtype: {an['strategy']['identified_subtype']}")
    print(f"           - Cluster: {an['analysis']['cluster_name']}")
    print(f"           - Predicted Response: {an['analysis']['predicted_response']} ({an['analysis']['response_confidence']*100:.1f}%)")
    print(f"           - Potential Pathways: {[p['category'] for p in an['strategy']['potential_pathways']]}")
    print(f"           - Stages count: {len(an['processing_stages'])}")

    # 5. Report Endpoint
    r = urllib.request.urlopen('http://127.0.0.1:8000/api/reports/ONC-001')
    rep = json.loads(r.read())
    print(f"[TEST 5/5] Report retrieved successfully. Title: {rep['strategy']['identified_subtype']} Strategy Report")

    server.should_exit = True
    print("\n>>> ALL API VERIFICATION TESTS COMPLETED SUCCESSFULLY! <<<")

if __name__ == '__main__':
    run_tests()
