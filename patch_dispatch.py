import re

with open("src/lib/api/dummy/dispatch.ts", "r") as f:
    content = f.read()

if 'getToken' not in content:
    content = 'import { getToken } from "./auth-utils";\n' + content

# Patch getDispatches
content = re.sub(r'(export const getDispatches = async \(\) => \{).*?(\n\})', 
           r'\1\n  const token = getToken();\n  const res = await fetch(`http://localhost:8000/api/farmer/dispatch`, { headers: { Authorization: `Bearer ${token}` } });\n  return (await res.json()) as any;\2', 
           content, flags=re.DOTALL)

# Patch checkDispatchSafety
content = re.sub(r'(export const checkDispatchSafety = async \([^)]+\) => \{).*?(\n\})', 
           r'\1\n  const token = getToken();\n  const res = await fetch(`http://localhost:8000/api/farmer/dispatch/safety-check`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ product_type: params.product_type, animal_flock_id: params.animal_flock_id, farm_id: "FARM-01" }) });\n  return (await res.json()) as any;\2', 
           content, flags=re.DOTALL)

# Patch getDispatchDetail
content = re.sub(r'(export const getDispatchDetail = async \([^)]+\): Promise<DispatchDetail> => \{).*?(\n\})', 
           r'\1\n  const token = getToken();\n  const res = await fetch(`http://localhost:8000/api/farmer/dispatch/${dispatchId}`, { headers: { Authorization: `Bearer ${token}` } });\n  return (await res.json()) as any;\2', 
           content, flags=re.DOTALL)

with open("src/lib/api/dummy/dispatch.ts", "w") as f:
    f.write(content)

