# Extract file and move to application directory
# Autor: Hugo Moura (hugo.moura@tecnobank.com.br)

$path = $env:PathApplication
$file = $env:FileName
$applicationName = $env:ApplicationName

Function ExtractAArtifact
{
    $fileName = $file + ".zip"

    Write-Output "Extraction started"

    Set-Location $path
    Expand-Archive -Literal .\$fileName -DestinationPath .\
    Set-Location $path + '\' + $applicationName
    Get-ChildItem -Path . -Recurse | Move-Item -Destination .\..
    Set-Location $path
    Remove-Item .\$fileName
    Remove-Item .\$applicationName

    Write-Host "Extraction completed"
}