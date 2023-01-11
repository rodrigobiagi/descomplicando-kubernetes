$ScriptPath = Split-Path $MyInvocation.MyCommand.Path
$date = Get-Date -Format "dd-MM-yyyy"


$VIUser = "usr.vmware@tecnobank.lan"
$VIPassword = (Get-Content "$ScriptPath\pass\password.txt") | ConvertTo-SecureString -Key (Get-Content "$ScriptPath\pass\key.txt")
$Credential = new-object System.Management.Automation.PSCredential $VIUser, $VIPassword
$VIServer = "tb-vcenter-100.tecnobank.lan"

Connect-VIServer -Server $VIServer -Credential $Credential -Force -ErrorAction SilentlyContinue -WarningAction 0 | Out-Null

if ($? -eq $true){
    Write-Host "Conexao OK"


    
    
    $vmNames = Get-VM | Where-Object {$_.PowerState -eq "PoweredOn"}
    
    foreach ($vmName in $vmNames){
        $vmName.Name
        $datDataStore = Get-Datastore | Select-Object * | Sort-Object FreeSpaceGB -Descending
        $dataSize = $datDataStore | Select-Object Name,FreeSpaceGb,CapacityGB -First 1
        Write-Host "$($dataSize.Name) $($dataSize.FreeSpaceGB)" -ForegroundColor Yellow

        $freePercent = Get-Datastore -Name $($dataSize.Name) | Select-Object @{N="DSFreespace"; E={[math]::Round(($dataSize.FreeSpaceGB)/($dataSize.CapacityGB)*100,2)}} | Where-Object {$_."Percentage(<20%)" -le 20} 


        if ($($freePercent.DSFreespace) -le "20"){
        Write-Host "$($dataSize.Name) - $($freePercent.DSFreespace)%" -ForegroundColor Green
            
        }
        else{
            Write-Host "o Datacenter não possui espaço suficiente para o clone"
            Break
        }
        

    }
}
else{
    Write-Host "Conexao Falhou"
}
Write-Host "o Datacenter não possui espaço suficiente para o clone" -ForegroundColor Red
Disconnect-VIServer * -Confirm:$false