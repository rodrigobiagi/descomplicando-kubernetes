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
    $vmException="TB-APP-123"
    $limit = (Get-Date).AddDays(-6).ToString("dd-MM-yyyy") # excluir clone com mais de 7 dias
    $vmNames = Get-VM | Where-Object {$_.PowerState -eq "PoweredOn"}

    foreach($vmName in $vmNames){
        Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($vmName.Name) - $($vmName.VMHost) - $($vmName.Folder)" >> $logFile
        
        $dataDataStore = Get-Datastore | Select-Object * | Sort-Object FreeSpaceGB -Descending
        $DSInformation = $dataDataStore | Select-Object Name,FreeSpaceGb,CapacityGB -First 1
        $DSFreeSize = ([math]::Round($($DSInformation.FreeSpaceGB),2))
        $DSFreePercent = ([math]::Round(($DSInformation.FreeSpaceGB)/($DSInformation.CapacityGB)*100-20,2))
        $vmSize = ([math]::Round($($vmName.UsedSpaceGb),2))
        $vmSizePercent = ([math]::Round($($vmSize)/$($DSFreeSize)*100,2))
        
        $vmCloneList = Get-VM -Name "$($vmName.Name)_*" -ErrorAction SilentlyContinue
        if($vmCloneList -and $vmSizePercente -lt $DSFreePercent){
            foreach($clone in $vmCloneList){
                $vmSize = ([math]::Round($($clone.UsedSpaceGb),2))

                if ($($clone.Name).Split("_")[-1] -gt $limit -and $($clone.Name).Split("_")[-2] -ne $vmException) {
                    Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($clone.Name) - possui um clone posterior a $limit" >> $logFile
                    Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($clone.Name) - nao sera criado um novo clone" >> $logFile
                }
                elseif ($($clone.Name).Split("_")[-1] -le $limit -and $($clone.Name).Split("_")[-2] -ne $vmException -and $vmSizePercent -lt $DSFreePercent) {
                    Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($clone.Name) - possui um clone anterior a $limit" >> $logFile
                    Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($clone.Name) - removendo clone..." >> $logFile
                    Remove-VM -VM "$($clone.Name)" -Confirm:$false -DeletePermanently

                    $cloneTeste = Get-VM -Name "$($vmName.Name)_*" -ErrorAction SilentlyContinue | Where-Object {$_.PowerState -eq "PoweredOff"}
                    if ($null -eq $cloneTeste -and $($clone.Name).Split("_")[-2] -ne $vmException -and $vmSizePercent -lt $DSFreePercent){
                        Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($vmName.Name) - clones removidos" >> $logFile
                        Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($vmName.Name) - iniciando um novo clone da VM" >> $logFile
                        Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($vmName.Name) - storage selecionado $($DSInformation.Name) espaco livre $($DSFreeSize)Gb - $($DSFreePercent)%" >> $logFile
                        New-VM -VM $($vmName.Name) -Name "$($vmName.Name)_$date" -Location "CLONES" -Datastore $($DSInformation.Name) -DiskStorageFormat Thin -ResourcePool $($vmName.ResourcePool)
                        Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($vmName.Name)_$date - finalizado clone da VM" >> $logFile
                    }
                    elseif ($vmSizePercent -gt $DSFreePercent){
                        Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - o Storage $($DSInformation.Name) nao possui espaco suficiente para o clone" >> $logFile
                    }
                }
            }
        }
        
        elseif ($($vmName.Name) -ne $vmException -and $vmSizePercent -lt $DSFreePercent) {
            Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($vmName.Name) - VM nao possui um clone" >> $logFile
            Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($vmName.Name) - iniciando clone da VM" >> $logFile
            Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($vmName.Name) - storage selecionado $($DSInformation.Name) espaco livre $($DSFreeSize)Gb - $($DSFreePercent)%" >> $logFile
            New-VM -VM $($vmName.Name) -Name "$($vmName.Name)_$date" -Location "CLONES" -Datastore $($DSInformation.Name) -DiskStorageFormat Thin -ResourcePool $($vmName.ResourcePool)
            Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($vmName.Name)_$date - finalizado clone da VM" >> $logFile
        }
        elseif ($DSFreePercent -gt "20" -or $vmSizePercent -gt $DSFreePercent) {
            Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - o Datacenter nao possui espaco minimo para o clone" >> $logFile
            Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $($vmName.Name) - $($vmSize)Gb - $($DSInformation.Name) - $($DSFreeSize)Gb"  >> $logFile
            #Break
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