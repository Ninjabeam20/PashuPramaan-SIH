import json
import os

with open(os.path.join(os.path.dirname(__file__), '../../canonical.json'), 'r') as f:
    data = json.load(f)

# We can just return the python dictionary directly
