Clear-Host
$ScriptPath = Split-Path $MyInvocation.MyCommand.Path
$Server = "TB-DC-002"

$UserCH = Read-Host "Digite o Login do usuário"

$User = "tecnobank.lan\svc.event"
$pass = Get-Content "$ScriptPath\pass\password.txt"
$key = Get-Content "$ScriptPath\pass\key.txt"

$Password = ($pass) | ConvertTo-SecureString -Key ($key)
$Credential = new-object System.Management.Automation.PSCredential $User, $Password

$ChkUser = get-aduser -Server $Server -Credential $Credential -filter {SamAccountName -eq $UserCH} -ErrorAction SilentlyContinue
$ChkUserLocked = (Get-Aduser -Server $Server -Credential $Credential -filter {SamAccountName -eq $UserCH} -ErrorAction SilentlyContinue -Properties LockedOut).LockedOut

if ($($ChkUser.SamAccountName) -eq $UserCH){
    if ($ChkUserLocked -eq $True){
        Unlock-ADAccount -Identity $UserCH -Server $Server -Credential $Credential
        Write-Host "CONTA DE USUÁRIO $UserCH DESBLOQUEADA COM SUCESSO" -ForegroundColor Red -BackgroundColor Green
    }
    Else{
        Write-Host "CONTA DE USUÁRIO $UserCH NÃO ESTÁ BLOQUEADA" -ForegroundColor DarkGreen -BackgroundColor Yellow
    }
}
Else{
    Write-Host "USUÁRIO DE REDE NÃO ENCONTRADO. VERIFIQUE AS INFORMAÇÕES E TENTE NOVAMENTE" -ForegroundColor DarkRed -BackgroundColor Yellow
}