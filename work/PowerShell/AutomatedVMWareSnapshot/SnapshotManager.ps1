$ScriptPath = Split-Path $MyInvocation.MyCommand.Path

$VIUser = "rodrigo.biagi@tecnobankdc.com"
$VIPassword = (Get-Content "$ScriptPath\pass\password.txt") | ConvertTo-SecureString -Key (Get-Content "$ScriptPath\pass\key.txt")
$Credential = new-object System.Management.Automation.PSCredential $VIUser, $VIPassword

$VIServer = "tb-vcenter-100.tecnobankdc.com"

Connect-VIServer -Server $VIServer -Credential $Credential -Force

$limit = (Get-Date).AddDays(-7) # excluir snapshot com mais de 7 dias
$dayOne = (Get-Date).AddDays(-3) # não gerar novo snapshot se houver algum com menos de 3 dias
$vmNames = Get-VM | Where-Object {$_.PowerState -eq "PoweredOn"}
$date = Get-Date -Format "yyyy-MM-dd"

$logFile = "$scriptPath\log\vmware_snapshot_$date.log"
$logfileTest = Test-Path -Path $logFile
if ($logFileTest -eq $false){
    New-Item -Path "$ScriptPath\log" -Name vmware_snapshot_$date.txt -ItemType File -Force
}
Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - Evento Iniciado" >> $logFile

foreach ($vmName in $vmNames){
    $snapshotDayOne = Get-Snapshot -VM $vmName |Select-Object * | Where-Object {$_.Created -lt $dayOne -or $_.Created -lt (Get-Date)}
    if ($snapshotDayOne){
        Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $vmName - já possui Snapshot com menos de 3 dias" >> $logFile
        Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $vmName - Nome $($snapshotDayOne.Name) - Data $($snapshotDayOne.Created) - Id $($snapshotDayOne.Id)" >> $logFile
    }
    else{
        Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $vmName - não possui Snapshot recente" >> $logFile
        Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - Criando Snapshot" >> $logFile
        New-Snapshot -VM $vmName -Name "$vmName - $date" -Description "Snapshot programado $date" -Memory:$true -ErrorAction SilentlyContinue
    }

    Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $vmName - verificando se existe snapshot com mais de 7 dias para a VM" >> $logFile
    $snapshots = Get-Snapshot -VM $vmName | Select-Object * | Where-Object {$_.Created -lt $limit}
    if ($snapshots){
        Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $vmName - encontrado snapshot com mais de 7 dias" >> $logFile
        foreach($snapshotOld in $snapshots){
            Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - Removendo Snapshot Nome $($snapshotOld.Name) - Data $($snapshotOld.Created) - Id $($snapshotOld.Id)" >> $logFile
            Get-Snapshot -VM $vmName -Id $($snapshotOld.Id) | Remove-Snapshot -Confirm:$false -ErrorAction SilentlyContinue
        }
    }
    else{
        Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - $vmName - não foi encontrado snapshot com mais de 7 dias" >> $logFile
    }
}
Write-Output "$(Get-Date -UFormat "%d/%m/%Y - %T") - Evento Finalizado" >> $logFile