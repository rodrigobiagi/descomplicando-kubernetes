$ScriptPath = Split-Path $MyInvocation.MyCommand.Path
$date = Get-Date -Format "dd-MM-yyyy"
$logFile = "$scriptPath\log\vmware_clone_$date.log"
$logfileTest = Test-Path -Path $logFile -ErrorAction SilentlyContinue
if ($logFileTest -eq $false){
    New-Item -Path "$ScriptPath\log" -Name $logFile -ItemType File -Force -ErrorAction SilentlyContinue
}
Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - Evento Iniciado" >> $logFile
Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - conectando no VCenter" >> $logFile
$VIUser = "usr.vmware@tecnobank.lan"
$VIPassword = (Get-Content "$ScriptPath\pass\password.txt") | ConvertTo-SecureString -Key (Get-Content "$ScriptPath\pass\key.txt")
$Credential = new-object System.Management.Automation.PSCredential $VIUser, $VIPassword
$VIServer = "tb-vcenter-100.tecnobank.lan"

$connection = Connect-VIServer -Server $VIServer -Credential $Credential -Force -ErrorAction SilentlyContinue -WarningAction 0 | Out-Null

if ($? -eq $true){
    Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - conectado ao VCenter $($connection.Name)" >> $logFile
    $vmException="TB-APP-111"
    $limit = (Get-Date).AddDays(-7).ToString("dd-MM-yyyy") # excluir clone com mais de 7 dias
    $vmNames = Get-VM -Name "TB-TST-127" | Where-Object {$_.PowerState -eq "PoweredOn"}

    foreach($vmName in $vmNames){
        Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($vmName.Name) - $($vmName.VMHost) - $($vmName.Folder)" >> $logFile
        
        $datDataStore = Get-Datastore | Select-Object * | Sort-Object FreeSpaceGB -Descending
        $dataStoreFreeSize = $datDataStore | Select-Object Name,FreeSpaceGb,CapacityGB -First 1
        $freePercent = Get-Datastore -Name $($dataStoreFreeSize.Name) | Select-Object @{N="DSFreespace"; E={[math]::Round(($dataStoreFreeSize.FreeSpaceGB)/($dataStoreFreeSize.CapacityGB)*100,2)}} | Where-Object {$_."Percentage(<20%)" -le 20} 

        $vmCloneList = Get-VM -Name "$($vmName.Name)_*" -ErrorAction SilentlyContinue
        if($vmCloneList -and $($freePercent.DSFreespace) -gt "20"){
            foreach($clone in $vmCloneList){
                if ($($clone.Name).Split("_")[-1] -gt $limit -and $($clone.Name).Split("_")[-2] -ne $vmException) {
                    Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($clone.Name) - possui um clone posterior a $limit" >> $logFile
                    Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($clone.Name) - nao sera criado um novo clone" >> $logFile
                }
                elseif ($($clone.Name).Split("_")[-1] -le $limit -and $($clone.Name).Split("_")[-2] -ne $vmException) {
                    Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($clone.Name) - possui um clone anterior a $limit" >> $logFile
                    Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($clone.Name) - removendo clone..." >> $logFile
                    Remove-VM -VM "$($clone.Name)" -Confirm:$false -DeletePermanently

                    $cloneTeste = Get-VM -Name "$($vmName.Name)_*" -ErrorAction SilentlyContinue | Where-Object {$_.PowerState -eq "PoweredOff"}
                    if ($null -eq $cloneTeste -and $($clone.Name).Split("_")[-2] -ne $vmException){
                        Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($vmName.Name) - clones removidos" >> $logFile
                        Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($vmName.Name) - iniciando um novo clone da VM" >> $logFile
                        Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($vmName.Name) - storage selecionado $($dataStoreFreeSize.Name) espaco livre $($freePercent.DSFreespace)%" >> $logFile
                        New-VM -VM $($vmName.Name) -Name "$($vmName.Name)_$date" -Location "CLONES" -Datastore $($dataStoreFreeSize.Name) -DiskStorageFormat Thin -ResourcePool $($vmName.ResourcePool)
                        Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($vmName.Name)_$date - finalizado clone da VM" >> $logFile
                    }
                }
            }
        }
        elseif ($($vmName.Name) -ne $vmException -and $($freePercent.DSFreespace) -gt "20") {
            Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($vmName.Name) - VM nao possui um clone" >> $logFile
            Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($vmName.Name) - iniciando clone da VM" >> $logFile
            Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($vmName.Name) - storage selecionado $($dataStoreFreeSize.Name) espaco livre $($freePercent.DSFreespace)%" >> $logFile
            New-VM -VM $($vmName.Name) -Name "$($vmName.Name)_$date" -Location "CLONES" -Datastore $($dataStoreFreeSize.Name) -DiskStorageFormat Thin -ResourcePool $($vmName.ResourcePool)
            Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($vmName.Name)_$date - finalizado clone da VM" >> $logFile
        }
        else {
            Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - o Datacenter nao possui espaco suficiente para os clones" >> $logFile
            Break
        }
    }
}
else {
    Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - falha ao conectar no VCenter $($connection.Name)" >> $logFile
}
Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - desconectando do VCenter" >> $logFile
Disconnect-VIServer * -Confirm:$false
Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - Evento Finalizado" >> $logFile
Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - -----------------------------------------------" >> $logFile