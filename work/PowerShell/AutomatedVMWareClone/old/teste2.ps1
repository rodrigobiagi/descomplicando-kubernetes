$ScriptPath = Split-Path $MyInvocation.MyCommand.Path
$VIUser = "rodrigo.biagi@tecnobankdc.com"
$VIPassword = (Get-Content "$ScriptPath\pass\password.txt") | ConvertTo-SecureString -Key (Get-Content "$ScriptPath\pass\key.txt")
$Credential = new-object System.Management.Automation.PSCredential $VIUser, $VIPassword
$VIServer = "tb-vcenter-100.tecnobankdc.com"
Connect-VIServer -Server $VIServer -Credential $Credential -Force


	#$Result = Get-Datastore | Sort-Object -Property FreespaceGB -Descending:$true | Select-Object -First 1
	#$result = Get-Datastore | Select-Object @{N="Name";E={$_.Name}},@{N="DSFreespace"; E={[math]::Round(($_.FreeSpaceGB)/($_.CapacityGB)*100,2)}} | Sort-Object DSFreespace -Descending
	#$result | Select-Object Name,DSFreespace -First 1
	
	#$datDataStore = Get-Datastore | Select-Object @{N="Name";E={$_.Name}},@{N="DSFreespace"; E={[math]::Round(($_.FreeSpaceGB)/($_.CapacityGB)*100,2)}} | Where-Object {$_.Name -ne "TW-VMW-501-LOCAL" -and $_.Name -ne  "TW-VMW-502-LOCAL"}
    #$dataStoreFreeSize = $datDataStore | Sort-Object DSFreespace -Descending | Select-Object Name,DSFreespace -First 1 
	#$dataStoreFreeSize

	$datDataStore = Get-Datastore | Select-Object @{N="Name";E={$_.Name}},@{N="DSFreespace"; E={[math]::Round(($_.FreeSpaceGB)/($_.CapacityGB)*100,2)}} | Sort-Object DSFreespace -Descending
	$dataStoreFreeSize = $datDataStore | Select-Object Name,DSFreespace -First 1
	$dataStoreFreeSize 
	

	#Get-Datastore | Select-Object {[math]::Round(($_.FreeSpaceGB)/($_.CapacityGB)*100,2)} | Where-Object {$_."Percentage(<20%)" -le 20} | Sort-Object Percentage -Descending
        #$dataStoreFreeSize = $datDataStore | Select-Object Name,FreeSpaceGb -First 1
		#$dataStoreFreeSize | Select-Object {(($_.FreeSpaceGB)/($_.CapacityGB)*100,2)} | Where-Object {$_."Percentage(<20%)" -le 20}
		