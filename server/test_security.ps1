Write-Host "--- Test A: HTTP to HTTPS Redirect ---"
curl.exe -I http://localhost:3000/api/cards

Write-Host "`n--- Test B: HTTPS & Security Headers (Helmet) ---"
curl.exe -k -I https://localhost:3443/api/cards

Write-Host "`n--- Test C: Rate Limiting ---"
node 100requesst_to_verify.js
