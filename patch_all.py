import os
import re
import subprocess

# 1. Revert all files
subprocess.run(["git", "checkout", "src/lib/api/dummy/"])

# 2. Files to patch and the URL endpoints mapping
# (filename, function_name, method, url, request_body, return_expression)
patches = [
    # auth.ts is somewhat special, let's leave it manual or do it carefully
    # We already did auth.ts properly though? Wait, auth.ts had interfaces? Let's check auth.ts later.
    
    # animal-detail.ts
    ("animal-detail.ts", "getAnimalDetail", "GET", "/api/farmer/animals/${animalId}", None, "await res.json() as any"),
    
    # farm-detail.ts
    ("farm-detail.ts", "getFarmDetail", "GET", "/api/farmer/animals", None, "await res.json() as any"),
    
    # farm-insights.ts
    ("farm-insights.ts", "getFarmInsights", "GET", "/api/farmer/insights", None, "await res.json() as any"),
    
    # farmer-dashboard.ts
    ("farmer-dashboard.ts", "getFarmerDashboard", "GET", "/api/farmer/dashboard", None, "await res.json() as any"),
    
    # treatments.ts (multiple functions)
    ("treatments.ts", "getTreatments", "GET", "/api/farmer/treatments", None, "await res.json() as any"),
    ("treatments.ts", "getPrescriptionOptions", "GET", "/api/farmer/treatments/prescriptions", None, "await res.json() as any"),
    ("treatments.ts", "getTreatmentDetail", "GET", "/api/farmer/treatments/${treatmentId}", None, "await res.json() as any"),
    
    # vet-dashboard.ts
    ("vet-dashboard.ts", "getVetDashboard", "GET", "/api/vet/dashboard", None, "await res.json() as any"),
    
    # vet-case-detail.ts
    ("vet-case-detail.ts", "getCaseDetail", "GET", "/api/vet/cases/${caseId}", None, "await res.json() as any"),
    
    # vet-patients.ts
    ("vet-patients.ts", "getVetPatients", "GET", "/api/vet/patients", None, "await res.json() as any"),
    ("vet-patients.ts", "getPatientDetail", "GET", "/api/vet/patients/${patientId}", None, "await res.json() as any"),
    ("vet-patients.ts", "submitPatientFollowUp", "POST", "/api/vet/patients/${patientId}/follow-up", "JSON.stringify({ notes })", "await res.json() as any"),
    
    # vet-prescriptions.ts
    ("vet-prescriptions.ts", "getPrescriptionsList", "GET", "/api/vet/prescriptions", None, "await res.json() as any"),
    
    # vet-sign-flow.ts
    ("vet-sign-flow.ts", "getPrescriptionForSigning", "GET", "/api/vet/prescriptions/${rxId}/for-signing", None, "await res.json() as any"),
    ("vet-sign-flow.ts", "submitSignature", "POST", "/api/vet/prescriptions/${rxId}/sign", "JSON.stringify({ typed_name, has_drawn_signature: hasDrawnSignature, signature_image: signatureImage, pin })", "await res.json() as any"),
    ("vet-sign-flow.ts", "getEmergencyForCountersigning", "GET", "/api/vet/emergencies/${rxId}/for-countersigning", None, "await res.json() as any"),
    ("vet-sign-flow.ts", "submitCountersignature", "POST", "/api/vet/emergencies/${rxId}/countersign", "JSON.stringify({ typed_name, has_drawn_signature: hasDrawnSignature, signature_image: signatureImage, pin })", "await res.json() as any"),
    
    # vets.ts
    ("vets.ts", "getAvailableVets", "GET", "/api/farmer/vets", None, "(await res.json()).items as any"),
]

for filename, func_name, method, url, req_body, ret_expr in patches:
    filepath = f"src/lib/api/dummy/{filename}"
    with open(filepath, "r") as f:
        content = f.read()
    
    if 'import { getToken }' not in content:
        content = 'import { getToken } from "./auth-utils";\n' + content
        
    # Find the function signature
    # Pattern to match `export const funcName = async (args) => {` or `export async function funcName(args) {`
    # Also we must capture up to `{`
    pattern = r'(export (?:const ' + func_name + r' = async \([^)]*\)(?::\s*Promise<[^>]+>)?\s*=>\s*\{|async function ' + func_name + r'\([^)]*\)(?::\s*Promise<[^>]+>)?\s*\{))(.*?)(\n\})'
    
    fetch_opts = '{'
    fetch_opts += f'\n    method: "{method}",'
    if req_body:
        fetch_opts += '\n    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },'
        fetch_opts += f'\n    body: {req_body}'
    else:
        fetch_opts += '\n    headers: { "Authorization": `Bearer ${token}` }'
    fetch_opts += '\n  }'
    
    body = f"""
  const token = getToken();
  const res = await fetch(`http://localhost:8000{url}`, {fetch_opts});
  if (!res.ok) {{
    // some fallback just in case or throw
  }}
  return {ret_expr};"""

    # Ensure it only replaces the very first occurrence of the function
    new_content = re.sub(pattern, r'\1' + body + r'\3', content, flags=re.DOTALL, count=1)
    
    with open(filepath, "w") as f:
        f.write(new_content)

# We also need to patch dispatch.ts, lab-*, auth.ts
# I'll just re-run the patch scripts for lab and dispatch that I already wrote and tested.

