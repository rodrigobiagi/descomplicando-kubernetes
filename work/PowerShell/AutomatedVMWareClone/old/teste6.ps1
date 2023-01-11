$ScriptPath = Split-Path $MyInvocation.MyCommand.Path
$VIUser = "usr.vmware@tecnobank.lan"
$VIPassword = (Get-Content "$ScriptPath\pass\password.txt") | ConvertTo-SecureString -Key (Get-Content "$ScriptPath\pass\key.txt")
$Credential = new-object System.Management.Automation.PSCredential $VIUser, $VIPassword
$VIServer = "tb-vcenter-100.tecnobank.lan"

$connection = Connect-VIServer -Server $VIServer -Credential $Credential -Force -ErrorAction SilentlyContinue -WarningAction 0 | Out-Null

$datDataStore = Get-Datastore | Select-Object * | Sort-Object FreeSpaceGB -Descending
$DSInformation = $datDataStore | Select-Object Name,FreeSpaceGb,CapacityGB -First 1
#$vmName = "TB-MNT-096"
$vmName = "TB-APP-111"
$vm = Get-VM -Name $vmName | Select-Object *
$vmSize = ([math]::Round($($vm.UsedSpaceGB),2))
$DSFreeSize = ([math]::Round($($DSInformation.FreeSpaceGB),2))
$DSFreePercent = ([math]::Round($($DSInformation.FreeSpaceGB)/($DSInformation.CapacityGB)*100-20,2))
$vmSize = ([math]::Round($($vmSize)/$($DSFreeSize)*100,2))


#$DSFreeSize = Get-Datastore -Name $($DSInformation.Name) | Select-Object @{N="DSFreeSize"; E={[math]::Round(($_.FreeSpaceGB),2)}}

if ($vmSize -gt $DSFreePercent){
    Write-Host "$($vm.Name) - $($vmSize) - $($DSInformation.Name)- $($DSFreeSize)"
    Write-Host "Fodeu...."
    Write-Host "a - $($vmSize)Gb" -ForegroundColor Red
    Write-Host "b - $($DSFreeSize)Gb" -ForegroundColor Red
    Write-Host "c - $($DSFreePercent)%" -ForegroundColor Red
    Write-Host "d - $($vmSize)%" -ForegroundColor Red
}
   
elseif($vmSize -lt $DSFreePercent){
    Write-Host "$($vm.Name) - $($vmSize) - $($DSInformation.Name)- $($DSFreeSize)"
    Write-Host "Ai sim..."
    Write-Host "a - $($vmSize)Gb" -ForegroundColor Green
    Write-Host "b - $($DSFreeSize)Gb" -ForegroundColor Green
    Write-Host "c - $($DSFreePercent)%" -ForegroundColor Green
    Write-Host "d - $($vmSize)%" -ForegroundColor Green
}
