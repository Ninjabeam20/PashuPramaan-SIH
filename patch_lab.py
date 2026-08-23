import re

files = {
    "src/lib/api/dummy/lab-dashboard.ts": {
        "func": "fetchLabDashboard",
        "url": "/api/lab/dashboard"
    },
    "src/lib/api/dummy/lab-dispatches.ts": {
        "func": "fetchLabDispatches",
        "url": "/api/lab/dispatches"
    },
    "src/lib/api/dummy/lab-testing.ts": {
        "func": "fetchTestingQueue",
        "url": "/api/lab/queue"
    },
    "src/lib/api/dummy/lab-results.ts": {
        "func": "fetchLabResults",
        "url": "/api/lab/results",
        "result_map": "data.items"
    },
    "src/lib/api/dummy/lab-reports.ts": {
        "func": "fetchLabReports",
        "url": "/api/lab/reports"
    }
}

for filepath, info in files.items():
    with open(filepath, "r") as f:
        content = f.read()

    # Add getToken import if not there
    if 'getToken' not in content:
        content = 'import { getToken } from "./auth-utils";\n' + content
        
    func_name = info["func"]
    url = info["url"]
    
    # We want to replace the entire body of the function.
    # The functions are defined as: export async function FuncName(args): Promise<Type> { ... }
    # Or export const FuncName = async (args) => { ... }
    
    # We will use regex to find the function signature and replace everything inside { ... }
    
    pattern = r'(export (?:async )?(?:function ' + func_name + r'|const ' + func_name + r' = async)[^{]*\{)(.*?)(\n\})'
    
    result_map = info.get("result_map", "data")
    
    fetch_body = f"""
  const token = getToken();
  const res = await fetch("http://localhost:8000{url}", {{
    headers: {{ "Authorization": `Bearer ${{token}}` }}
  }});
  const data = await res.json();
  return {result_map} as any;"""

    content = re.sub(pattern, r'\1' + fetch_body + r'\3', content, flags=re.DOTALL)
    
    with open(filepath, "w") as f:
        f.write(content)

# We also need to patch the other functions in those files!
# lab-dispatches.ts has fetchDispatchDetail and submitSampleReceipt
with open("src/lib/api/dummy/lab-dispatches.ts", "r") as f:
    c = f.read()
c = re.sub(r'(export async function fetchDispatchDetail\([^)]+\)[^{]*\{).*?(\n\})', 
           r'\1\n  const token = getToken();\n  const res = await fetch(`http://localhost:8000/api/lab/dispatches/${dispatchId}`, { headers: { Authorization: `Bearer ${token}` } });\n  return (await res.json()) as any;\2', 
           c, flags=re.DOTALL)
c = re.sub(r'(export async function submitSampleReceipt\([^)]+\)[^{]*\{).*?(\n\})', 
           r'\1\n  const token = getToken();\n  const res = await fetch(`http://localhost:8000/api/lab/dispatches/${dispatchId}/receive`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });\n  return (await res.json()) as any;\2', 
           c, flags=re.DOTALL)
with open("src/lib/api/dummy/lab-dispatches.ts", "w") as f:
    f.write(c)

# lab-testing.ts has fetchTestingWorkspace and submitTestResult
with open("src/lib/api/dummy/lab-testing.ts", "r") as f:
    c = f.read()
c = re.sub(r'(export async function fetchTestingWorkspace\([^)]+\)[^{]*\{).*?(\n\})', 
           r'\1\n  const token = getToken();\n  const res = await fetch(`http://localhost:8000/api/lab/workspace/${sampleId}`, { headers: { Authorization: `Bearer ${token}` } });\n  return (await res.json()) as any;\2', 
           c, flags=re.DOTALL)
c = re.sub(r'(export async function submitTestResult\([^)]+\)[^{]*\{).*?(\n\})', 
           r'\1\n  const token = getToken();\n  const res = await fetch(`http://localhost:8000/api/lab/workspace/${sampleId}/tests`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });\n  return (await res.json()) as any;\2', 
           c, flags=re.DOTALL)
with open("src/lib/api/dummy/lab-testing.ts", "w") as f:
    f.write(c)

# lab-results.ts has verifyLabResult
with open("src/lib/api/dummy/lab-results.ts", "r") as f:
    c = f.read()
c = re.sub(r'(export async function verifyLabResult\([^)]+\)[^{]*\{).*?(\n\})', 
           r'\1\n  const token = getToken();\n  const res = await fetch(`http://localhost:8000/api/lab/results/${resultId}/verify`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });\n  return (await res.json()) as any;\2', 
           c, flags=re.DOTALL)
with open("src/lib/api/dummy/lab-results.ts", "w") as f:
    f.write(c)

