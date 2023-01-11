variable "subscription_id" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "resource_group_location" {
  type = string
}
#AKS Var
variable "cluster_name" {
  type = string
}

variable "k8s_version" {
  type = string
}

variable "network_plugin" {
  type = string
}

variable "network_policy" {
  type = string
}

variable "dns_preffix" {
  type = string
}

variable "agent_count_user_nodepool" {
  type = number
}
  
variable "subnet_id" {
  description = "Subnet ID para integração do cluster com uma VNET existênte"
  type = string
}

#ACR Var
variable "acr_name" {
  type = string
}

variable "acr_sku" {
  type = string
}