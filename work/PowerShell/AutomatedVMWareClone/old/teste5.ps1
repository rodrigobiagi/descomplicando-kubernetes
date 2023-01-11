$ScriptPath = Split-Path $MyInvocation.MyCommand.Path

$VIUser = "rodrigo.biagi@tecnobankdc.com"
$VIPassword = (Get-Content "$ScriptPath\pass\password.txt") | ConvertTo-SecureString -Key (Get-Content "$ScriptPath\pass\key.txt")
$Credential = new-object System.Management.Automation.PSCredential $VIUser, $VIPassword
$VIServer = "tb-vcenter-100.tecnobankdc.com"

Connect-VIServer -Server $VIServer -Credential $Credential -Force -ErrorAction SilentlyContinue -WarningAction 0 | Out-Null

if ($? -eq $true){
    Write-Host "Conexao OK"
    $limit = (Get-Date).AddDays(-6).ToString("dd-MM-yyyy") # excluir clone com mais de 7 dias
    $vmNames = Get-VM -Name "TB-APP-111" | Where-Object {$_.PowerState -eq "PoweredOn"}

    foreach($vmName in $vmNames){
        $oldClone = Get-VM -Name "$($vmName.Name)_*" -ErrorAction SilentlyContinue
        if ($oldClone){
            foreach($clone in $oldClone){
                if($($clone.Name).Split("_")[-1] -ge $limit){
                    Write-Host "Antigo Clone $($clone.Name)"
                }
                elseif ($($clone.Name).Split("_")[-1] -lt $limit) {
                    Write-Host "Recente Clone $($clone.Name)"
                }
            }
        }
        else{
            Write-Host "Criando novo Clone"
        }        




    }
}
else{
    Write-Host "Conexao Falhou"
}
Disconnect-VIServer * -Confirm:$false

