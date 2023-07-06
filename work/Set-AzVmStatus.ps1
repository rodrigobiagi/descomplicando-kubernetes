<#
Script functions:
Start
Stop
Restart
#>
function Set-AzVmStatus {
    param (
        [Parameter(Mandatory=$true)][array]$VmName,
        [Parameter(Mandatory=$true)][string]$ResourceGroup,
        [Parameter(Mandatory=$true)][string]$Status
    )
    $vms = @($VmName)
    foreach ($vm in $vms){
        $checkVM = Get-AzVM -ResourceGroupName $ResourceGroup -Name $vm -ErrorAction SilentlyContinue
        if ($checkVM){
            $vmStatus = (((Get-AzVM -ResourceGroupName $ResourceGroup -Name $vm -Status).Statuses.code[1]) -replace "PowerState/","")
            # function to Deallocate VM
            if ($vmStatus -eq "running" -and $status -eq "stop" -or $vmStatus -eq "stopped" -and $status -eq "stop"){
                Write-Output "$vm are $vmStatus"
                Write-Output "Deallocating $vm"
                Stop-AzVM -ResourceGroupName $ResourceGroup -Name $vm -Force -ErrorAction SilentlyContinue
                $vmStatus = (((Get-AzVM -ResourceGroupName $ResourceGroup -Name $vm -Status).Statuses.code[1]) -replace "PowerState/","")
                if($vmStatus -ne "deallocated" -and $status -eq "stop"){
                    Write-Output "$vm state is $vmStatus"
                    Write-Output "Error deallocating $vm"
                }
                elseif ($vmStatus -eq "deallocated"){
                    Write-Output "$vm $vmStatus"
                }
            }
            elseif ($vmStatus -eq "deallocated" -and $status -eq "stop") {
                Write-Output "$vm already is $vmStatus"
            }
            # function to Start VM
            elseif ($vmStatus -eq "stopped" -and $status -eq "start" -or $vmStatus -eq "deallocated" -and $status -eq "start"){
                Write-Output "$vm is $vmStatus"
                Write-Output "Starting $vm"
                Start-AzVM -ResourceGroupName $ResourceGroup -Name $vm -ErrorAction SilentlyContinue
                $vmStatus = (((Get-AzVM -ResourceGroupName $ResourceGroup -Name $vm -Status).Statuses.code[1]) -replace "PowerState/","")
                if($vmStatus -ne "running" -and $status -eq "start"){
                    Write-Output "$vm status is $vmStatus"
                    Write-Output "Error starting $vm"
                }
                elseif ($vmStatus -eq "running"){
                    Write-Output "$vm $vmStatus"
                }
            }
            elseif ($vmStatus -eq "running" -and $status -eq "start") {
                Write-Output "$vm already is $vmStatus"
            }
            # function to Restart VM
            elseif ($vmStatus -eq "running" -and $status -eq "restart") {
                Write-Output "Restarting $vm"
                Restart-AzVM -ResourceGroupName $ResourceGroup -Name $vm -ErrorAction SilentlyContinue
                $vmStatus = (((Get-AzVM -ResourceGroupName $ResourceGroup -Name $vm -Status).Statuses.code[1]) -replace "PowerState/","")
                if($vmStatus -ne "running" -and $status -eq "restart"){
                    Write-Output "$vm status is $vmStatus"
                    Write-Output "Error restarting $vm"
                }
                elseif ($vmStatus -eq "running"){
                    Write-Output "$vm $vmStatus"
                }
            }
            elseif ($vmStatus -eq "deallocated" -and $status -eq "restart" -or $vmStatus -eq "stopped" -and $status -eq "restart"){
                Write-Output "$vm is $vmStatus"
                Write-Output "Select another status! ex. Start or Stop"
            }
        }
        else{
            Write-Output "$vm under resource group $ResourceGroup was not found."
            Write-Output "review resource group or VM name and try again."
        }
    }
}
Set-AzVmStatus -ResourceGroup "tbk_prd_infra" -VmName "tba-app-123" -Status "Stop"

<#
Command example:
Set-AzVmStatus -ResourceGroup "tbk_prd_infra" -VmName "tba-app-123","tba-app-124","tba-app-126","tba-app-127","tba-app-128" -Status "Start"
Set-AzVmStatus -ResourceGroup "tbk_prd_infra" -VmName "tba-app-123","tba-app-124","tba-app-126","tba-app-127","tba-app-128" -Status "Stop"
Set-AzVmStatus -ResourceGroup "tbk_prd_infra" -VmName "tba-app-123","tba-app-124","tba-app-126","tba-app-127","tba-app-128" -Status "Restart"
or any commands with single vm
Set-AzVmStatus -ResourceGroup "tbk_prd_infra" -VmName "tba-app-123" -Status "Start"
#>