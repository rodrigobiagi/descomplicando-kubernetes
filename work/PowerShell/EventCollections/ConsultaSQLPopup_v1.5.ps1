<#
Name: ConsultaSQLPopup.ps1
Author: Rodrigo Biagi
Version: 1.5
Changelog: 
    - Search Engine Options
    - Searching Engine on Database
    - Result Popup
#>
$dataSource = "TB-DBA-085\TB_DSN"
$database = "Auditoria"
$tableName = "GeneralEvents"
$user = “usrRWEInfra”
$pass = "0HQhN)-8cbhat,Q]m%g"

$Search = Read-Host "Digite sua Busca Ex. (Conta de Usuário): .script"
Write-Host "=============================== EventID Auditados ===============================" -ForegroundColor Green
Write-Host "4625 - Uma conta falha no logon" -ForegroundColor Green
Write-Host "4720 - Uma conta de usuário foi criada" -ForegroundColor Green
Write-Host "4722 - Uma conta de usuário foi ativado" -ForegroundColor Green
Write-Host "4725 - Uma conta de usuário foi desativado" -ForegroundColor Green
Write-Host "4726 - Uma conta de usuário foi excluído" -ForegroundColor Green
Write-Host "4740 - Uma conta de usuário foi bloqueada" -ForegroundColor Green
Write-Host "4743 - Uma conta de computador foi excluída" -ForegroundColor Green
Write-Host "4756 - Um membro foi adicionado a um grupo universal com segurança habilitada" -ForegroundColor Green
Write-Host "4757 - Um membro foi removido de um grupo universal com segurança habilitada" -ForegroundColor Green
Write-Host "4771 - Pré-autenticação Kerberos falhou" -ForegroundColor Green
Write-Host "4781 - O nome de uma conta foi alterado" -ForegroundColor Green
Write-Host "5136 - Um objeto de serviço de diretório foi modificado" -ForegroundColor Green
Write-Host "5140 - Um objeto de compartilhamento de rede foi acessado" -ForegroundColor Green
Write-Host "5142 - Um objeto de compartilhamento de rede foi adicionado" -ForegroundColor Green
Write-Host "5143 - Um objeto de compartilhamento de rede foi modificad" -ForegroundColor Green
Write-Host "5144 - Um objeto de compartilhamento de rede foi excluídoo" -ForegroundColor Green
Write-Host "5145 - Um objeto de compartilhamento de rede foi verificado para ver se o cliente pode ter acesso desejado" -ForegroundColor Green
Write-Host "7000 - O serviço não pode ser iniciado" -ForegroundColor Green
Write-Host "7009 - TimeOut do serviço" -ForegroundColor Green
Write-Host "7036 - Alterado o estado do serviço" -ForegroundColor Green
Write-Host "7040 - Alterado inicialização do serviço" -ForegroundColor Green
Write-Host "7045 - Um novo serviço foi instalado" -ForegroundColor Green
Write-Host "Digite * para todos os registros de EventID" -ForegroundColor Green
Write-Host "=================================================================================" -ForegroundColor Green
$SearchId = Read-Host "Digite EventID"

$wshell = New-Object -ComObject Wscript.Shell
$connectionString = “Server=$dataSource;uid=$user; pwd=$pass;Database=$database;Integrated Security=False;”
$connection = New-Object System.Data.SqlClient.SqlConnection
$connection.ConnectionString = $connectionString
$connection.Open()

$query = "
    select TOP 1 *
        FROM [$database].[dbo].[$tableName]
        where Message LIKE '%$Search%' AND Id LIKE '%$SerachId%'
        ORDER BY TimeCreated DESC
    "

$command = $connection.CreateCommand()
$command.CommandTimeout = 0
$command.CommandText  = $query

$result = $command.ExecuteReader()

$table = new-object "System.Data.DataTable"
$table.Load($result)

$result =  "ID: $($table.Id)`
TimeCreated: $($table.TimeCreated)`
MachineName: $($table.MachineName)`
LogName: $($table.LogName)`
RecordID: $($table.RecordID)`
Message: $($table.Message)"

$wshell.Popup($result,0,"Done")

$connection.Close()