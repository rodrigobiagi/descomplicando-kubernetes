$user = "armstrong"
$userFullName = "Armstrong"
$userDescription = "Local Admin User"
$builtinSID = "S-1-5-32-544"
$pass = ConvertTo-SecureString "Tw@123!Mb" -AsPlainText -Force
$userExist = Get-LocalUser -Name $user -ErrorAction SilentlyContinue


if ($user -eq $($userExist.Name)){
    Write-Output "User already exists. Set new password"
    Set-LocalUser -Name $user -Password $pass -FullName $userFullName -Description $userDescription -AccountNeverExpires
    $member = Get-LocalGroupMember -SID $builtinSID -Member $user -ErrorAction SilentlyContinue
    $group = Get-LocalGroup -SID $builtinSID

    if($($member.Name.Split('\')[1]) -eq $user){
        Write-Output "User already member group $($member.Name)"
    }
    else{
        
        Write-Output "Add user $user to a group $($group.Name)"
        Add-LocalGroupMember -SID $builtinSID -Member $user
    }
}
else{
    New-LocalUser -Name $user -Password $pass -FullName $userFullName -Description $userDescription -AccountNeverExpires -PasswordNeverExpires -UserMayNotChangePassword
    try {
        Get-LocalUser -Name $user
        Write-Output "$user created"
    }
    catch {
            Write-Output "Creating local account failed"
    }
    Add-LocalGroupMember -SID $builtinSID -Member $user
    try {
        Get-LocalGroupMember -SID $builtinSID -Member $user
        $group = Get-LocalGroup -SID $builtinSID
        Write-Output "User $user add to a local group $($group.Name)"
    }
    catch {
        Write-Output "Add $user to local group $($group.Name) failed"
    }        
}
