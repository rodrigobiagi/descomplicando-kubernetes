variable "subscription_id" {
  type = string
  default = "ee6fe381-276f-4841-a137-013a36a53279"
}

variable "resource_group_name" {
  type = string
  default = "tbk-rg-prd-shared"
}

variable "resource_group_location" {
  type = string
  default = "brazilsouth"
}
#AKS Var

variable "cluster_name" {
  type = string
  default = "tbk-aks-prd-001"
}

variable "k8s_version" {
  type = string
  default = "1.20.9"
}

variable "network_plugin" {
  type = string
  default = "azure"
}

variable "network_policy" {
  type = string
  default = "azure"
}

variable "dns_preffix" {
  type = string
  default = "tbkaksprd001"
}

variable "agent_count_user_nodepool" {
  type = number
  default = 1
}
  
variable "subnet_id" {
  description = "Subnet ID para integração do cluster com uma VNET existênte"
  type = string
  default = "/subscriptions/ee6fe381-276f-4841-a137-013a36a53279/resourceGroups/tbk_infra_brazilsouth/providers/Microsoft.Network/virtualNetworks/tbk_brazilsouth_vnet/subnets/tbk_apl"
}

#ACR Var

variable "acr_name" {
  type = string
  default = "tbkacrprd001"
}

variable "acr_sku" {
  type = string
  default = "Basic"
}