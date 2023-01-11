$ScriptPath = Split-Path $MyInvocation.MyCommand.Path
$VIUser = "rodrigo.biagi@tecnobankdc.com"
$VIPassword = (Get-Content "$ScriptPath\pass\password.txt") | ConvertTo-SecureString -Key (Get-Content "$ScriptPath\pass\key.txt")
$Credential = new-object System.Management.Automation.PSCredential $VIUser, $VIPassword
$VIServer = "tb-vcenter-100.tecnobankdc.com"
Connect-VIServer -Server $VIServer -Credential $Credential -Force


$datDataStores = Get-Datastore | Select-Object * | Sort-Object FreeSpaceGB -Descending 

#foreach($datDataStore in $datDataStores){
    

$dataSize = $datDataStores | Select-Object Name,FreeSpaceGB -Last 2
$dataSize.Name
$dataSize.FreeSpaceGB
#write-host "$($datDataStore.Name) - $($datDataStore.FreeSpaceMb) - $($datDataStore.FreeSpaceGB)"
#}