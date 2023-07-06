$ScriptPath = Split-Path $MyInvocation.MyCommand.Path
$date = Get-Date -Format "yyyy-MM-dd"
$limit = (Get-Date).AddDays(-7) | Get-Date -Format "yyyy-MM-dd"
$organization= "tecnobanksa-interno"
$pat= "cjqo4s7fpmvpmhfh4py7z7s3uf3cd6y3ifgh266zrxsshhtfgmsa"
$path= "C:\temp\repo"
$env:AZURE_DEVOPS_EXT_PAT = 'cjqo4s7fpmvpmhfh4py7z7s3uf3cd6y3ifgh266zrxsshhtfgmsa'
$containerUrl = "https://tbkstorageaccount.blob.core.windows.net/repo"
$containerToken = "?st=2023-06-12T12:20:07Z&se=2100-12-06T20:20:07Z&si=repo&spr=https&sv=2022-11-02&sr=c&sig=EF3GedPChtX4HuPWrXR5xtNVn%2FDlJby6ayIZ0hWk7Os%3D"

#az devops login --organization https://$organization.visualstudio.com
#az login --use-device-code

$adoprojs = az devops project list
$projObjs = $adoprojs | ConvertFrom-Json
New-Item -Path $path -Name $date -ItemType Directory

# Delete oldest folders
$fileList = azcopy list ("$containerUrl"+"$containerToken")
foreach ($file in $fileList){
    $fileDate = $file.Split(':')[1].Split('/').Split(';')[0].Trim()
    if ($fileDate -lt $limit){
        azcopy remove ("$containerUrl/"+"$fileDate"+"$containerToken") --recursive=true
    }
    else {
        Write-Output "No files encontred."
    }
}
# Start Back-UP
foreach ($proj in $projObjs.value.name) {
    write-host "looking in $proj ADO project for repos"
    az devops configure --defaults organization=https://$organization.visualstudio.com project=$proj
    $jsonRepos = az repos list
    $RepoObjs = $jsonRepos | ConvertFrom-Json
    New-Item -Path $path\$date\ -Name $proj -ItemType Directory -Force
    Set-Location -Path $path\$date\$proj
    foreach ($repo in $RepoObjs) {
        write-host "  " $repo.name
        git clone https://$pat@dev.azure.com/$organization/$proj/_git/$($repo.name)
        #Compress-Archive -Path $path\$date\$proj\$($repo.name) -DestinationPath $path\$date\$proj\$($repo.name).zip -CompressionLevel Optimal
        #Remove-Item -Path $path\$date\$proj\$($repo.name) -Force -Recurse
    }
    azcopy copy "$path\$date\$proj" ("$containerUrl"+"/$date"+"$containerToken") --recursive=true
}
# Delete source folder
Set-Location -Path $path
#Remove-Item -Path $path\$date -Force -Recurse