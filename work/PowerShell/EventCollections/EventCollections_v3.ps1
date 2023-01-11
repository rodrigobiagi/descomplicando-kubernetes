<#
Name: EventCollections_v2.0.ps1
Author: Rodrigo Biagi
Version: 2.5
Changelog: 
    - Filter Log Event ID
    - Specified authentication SQL Account
    - Filtro XML para 3h de log. Schedule rodando a cada 2h
    - Log limitado para 5Gb para teste de performance de leitura / gravação.
    - Adicionado a linha de Timeout $bulkCopy.BulkCopyTimeout = "7200"
    - Alterado o Path de Logs "Microsoft-Windows-AppModel-Runtime/Admin"
Obs:
    - Configurar o Schedule para cada duas horas. O Script captura informações de Log de 3 horas do inicio do Job
    - Recomendado um log de aproximadamente 5Gb configurado para sobrescrever os mais antigos, dessa forma a execução do Job é de aproximandamente 1h.

Version: 3
Changelog:
    - XML Array
#>

Write-Host "processo iniciado" $Date(Get-Date) -ForegroundColor Green
$ScriptPath = Split-Path $MyInvocation.MyCommand.Path
$dataSource = "TB-DBA-085\TB_DSN"
$database = "Auditoria"

# Filtro XML para 3h de log. Schedule rodando a cada 2h
# Log limitado para 5Gb para teste de performance de leitura / gravação.
$xmlFileAudit = @'
<QueryList>
  <Query Id="0" Path="Tecnobank-FileAudit">
    <Select Path="Tecnobank-FileAudit">*[System[TimeCreated[timediff(@SystemTime) &lt;=3600000]]]</Select>
  </Query>
</QueryList>
'@

$xmlSecurity = @'
<QueryList>
  <Query Id="0" Path="Tecnobank-Security">
    <Select Path="Tecnobank-Security">*[System[TimeCreated[timediff(@SystemTime) &lt;=3600000]]]</Select>
  </Query>
</QueryList>
'@

$xmlSystem = @'
<QueryList>
  <Query Id="0" Path="Tecnobank-System">
    <Select Path="Tecnobank-System">*[System[TimeCreated[timediff(@SystemTime) &lt;=3600000]]]</Select>
  </Query>
</QueryList>
'@

$xmlArray = @($xmlFileAudit,$xmlSecurity,$xmlSystem)

for ($i=0; $i -lt $xmlArray.length; $i++) {
    Write-Host "iniciado coleta de evento" $Date(Get-Date) -ForegroundColor Green
    $xml = $xmlArray[$i]

    $events = Get-WinEvent -FilterXml $xml |  Select-Object ID, LevelDisplayName, LogName, MachineName, Message, ProviderName, RecordID, TaskDisplayName, TimeCreated  
    
    Write-Host "Gravando Dados no SQL" $Date(Get-Date) -ForegroundColor Green
    $connectionString = "Data Source=$dataSource;Database=$database;Integrated Security=true;Initial Catalog=Auditoria;" # Integrated Account
    #$connectionString = "Data Source=$dataSource;Database=$database;uid=$User;pwd=$Pass;Integrated Security=False;" # SQL Account
    $bulkCopy = new-object ("Data.SqlClient.SqlBulkCopy") $connectionString
    $bulkCopy.DestinationTableName = "GeneralEvents"
    $bulkCopy.BulkCopyTimeout = "7200" # teste de timeout para 2horas de gravação "tempo default é 30s"
    $dt = New-Object "System.Data.DataTable"
 
    # build the datatable
    $cols = $events | select -first 1 | get-member -MemberType NoteProperty | select -Expand Name
    foreach ($col in $cols)  {$null = $dt.Columns.Add($col)}
  
    foreach ($event in $events)
      {
         $row = $dt.NewRow()
         foreach ($col in $cols) { $row.Item($col) = $event.$col }
         $dt.Rows.Add($row)
      }
 
    # Grava no Banco
    $bulkCopy.WriteToServer($dt)
    Write-Host "Gravação dos dados concluído" $Date(Get-Date) -ForegroundColor Green
}

<#
Filtro XML por período
01 hora  - 3600000
02 horas - 7200000
06 horas - 21600000
12 horas - 43200000
30 dias  - 2592000000

============ Filtro por Log e Período ============
<QueryList>
	<Query Id="0" Path="ForwardedEvents">
		<Select Path="ForwardedEvents">*[System[(EventID=4768 or EventID=4771 or EventID=4625 or EventID=4688 or EventID=4689 or EventID=4634 or EventID=4624) and TimeCreated[timediff(@SystemTime) &lt;= 86400000]]]</Select>
	</Query>
</QueryList>
============ Filtro por Período ============
<QueryList>
  <Query Id="0" Path="ForwardedEvents">
    <Select Path="ForwardedEvents">*[System[TimeCreated[timediff(@SystemTime) &lt;=3600000]]]</Select>
  </Query>
</QueryList>
#>