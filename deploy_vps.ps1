param(
    [string]$VpsIp = "40.83.100.54",
    [string]$VpsUser = "mdtha",
    [string]$KeyPath = "..\vps1_key.pem"
)

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Rosetta Azure VPS Deployment Assistant" -ForegroundColor Cyan
Write-Host "Target: $VpsUser@$VpsIp" -ForegroundColor Cyan
Write-Host "Key: $KeyPath" -ForegroundColor Cyan
Write-Host "=============================================`n" -ForegroundColor Cyan

# Resolve key path
if (-not (Test-Path $KeyPath)) {
    if (Test-Path "vps1_key.pem") {
        $KeyPath = "vps1_key.pem"
    } elseif (Test-Path "c:\Users\ItsMe_Tanjim\Documents\Web_3_2\vps1_key.pem") {
        $KeyPath = "c:\Users\ItsMe_Tanjim\Documents\Web_3_2\vps1_key.pem"
    } else {
        Write-Host "Warning: Key file not found at $KeyPath. Please specify -KeyPath <path-to-pem>" -ForegroundColor Yellow
    }
}

# 1. Test Port 22 connectivity
Write-Host "Testing network connectivity to $VpsIp on port 22..." -ForegroundColor Yellow
$test = Test-NetConnection -ComputerName $VpsIp -Port 22 -WarningAction SilentlyContinue

if (-not $test.TcpTestSucceeded) {
    Write-Host "`nError: Cannot connect to $VpsIp on port 22." -ForegroundColor Red
    Write-Host "Possible causes:" -ForegroundColor Yellow
    Write-Host "  1. The Azure Virtual Machine is stopped / deallocated in the Azure Portal." -ForegroundColor White
    Write-Host "     Please go to portal.azure.com and start your VM." -ForegroundColor White
    Write-Host "  2. The VM's public IP address has changed after a restart." -ForegroundColor White
    Write-Host "     Run: .\deploy_vps.ps1 -VpsIp <NEW_IP>" -ForegroundColor White
    Write-Host "  3. An Azure Network Security Group (NSG) rule is blocking inbound port 22." -ForegroundColor White
    exit 1
}

Write-Host "Network connection to $VpsIp:22 successful!`n" -ForegroundColor Green

# 2. Transfer docker-compose.yml
Write-Host "Transferring docker-compose.yml to VPS (~/app)..." -ForegroundColor Yellow
$remoteTarget = $VpsUser + "@" + $VpsIp + ":~/app/docker-compose.yml"
$sshTarget = $VpsUser + "@" + $VpsIp

ssh -i $KeyPath -o StrictHostKeyChecking=no $sshTarget "mkdir -p ~/app"
scp -i $KeyPath -o StrictHostKeyChecking=no "$PSScriptRoot\docker-compose.yml" $remoteTarget

# 3. Deploy containers on VPS
Write-Host "`nExecuting remote deployment via Docker Compose..." -ForegroundColor Yellow
$cmd = "sudo systemctl stop nginx || true; sudo systemctl disable nginx || true; cd ~/app && docker compose down || true && docker compose pull || true && docker compose up -d --remove-orphans && docker ps"
ssh -i $KeyPath -o StrictHostKeyChecking=no $sshTarget $cmd

# 4. Verify deployment health
Write-Host "`nVerifying health endpoint (http://$VpsIp/api/health)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
try {
    $health = Invoke-RestMethod -Uri "http://$VpsIp/api/health" -TimeoutSec 10
    Write-Host "Health Check Passed:" -ForegroundColor Green
    $health | Format-List
} catch {
    Write-Host "Warning: Health check timed out or returned an error. Check docker logs on the VPS." -ForegroundColor Yellow
}

Write-Host "`nDeployment sequence completed!" -ForegroundColor Green
