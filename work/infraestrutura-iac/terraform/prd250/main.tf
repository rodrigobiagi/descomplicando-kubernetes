provider "azurerm" {
  environment = "public"
  subscription_id = "#{subscription_id}#"
  client_id       = "#{client_id}#"
  client_secret   = "#{client_secret}#"
  tenant_id       = "#{tenant_id}#"
  features {}
}


#Definir se iremos utilizar Azure Monitor
/* resource "random_id" "log_analytics_workspace_name_suffix" {
    byte_length = 8
}

resource "azurerm_log_analytics_workspace" "test" {
    # The WorkSpace name has to be unique across the whole of azure, not just the current subscription/tenant.
    name                = "${var.log_analytics_workspace_name}-${random_id.log_analytics_workspace_name_suffix.dec}"
    location            = var.log_analytics_workspace_location
    resource_group_name = azurerm_resource_group.k8s.name
    sku                 = var.log_analytics_workspace_sku
}

resource "azurerm_log_analytics_solution" "test" {
    solution_name         = "ContainerInsights"
    location              = azurerm_log_analytics_workspace.test.location
    resource_group_name   = azurerm_resource_group.k8s.name
    workspace_resource_id = azurerm_log_analytics_workspace.test.id
    workspace_name        = azurerm_log_analytics_workspace.test.name

    plan {
        publisher = "Microsoft"
        product   = "OMSGallery/ContainerInsights"
    }
}
 */

resource "azurerm_kubernetes_cluster" "aks-prd250" {
  name                = var.cluster_name
  location            = var.resource_group_location
  resource_group_name = var.resource_group_name
  dns_prefix          = var.dns_preffix
  kubernetes_version  = var.k8s_version

  default_node_pool {
    name           = "system"
    node_count     = 2
    vm_size        = "Standard_DS2_v2"
    vnet_subnet_id = var.subnet_id
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin = var.network_plugin
    network_policy = var.network_policy
  }

  # addon_profile {
  #   aci_connector_linux {
  #     enabled = false
  #   }

  #   azure_policy {
  #     enabled = false
  #   }

  #   http_application_routing {
  #     enabled = false
  #   }

  #   oms_agent {
  #     enabled = false
  #   }
  # }
}

resource "azurerm_kubernetes_cluster_node_pool" "user_node_pool" {
  name                  = "user"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.aks-prd250.id
  vm_size               = "Standard_D8s_v3"
  node_count            = var.agent_count_user_nodepool
  vnet_subnet_id        = var.subnet_id
  max_pods              = 80
}

# # Container Registry
# resource "azurerm_container_registry" "acr-prd" {
#   name                = var.acr_name
#   resource_group_name = var.resource_group_name
#   location            = var.resource_group_location
#   sku                 = var.acr_sku
#   admin_enabled       = false
# }

# resource "azurerm_role_assignment" "role_acrpull" {
#   scope                            = azurerm_container_registry.acr-prd.id
#   role_definition_name             = "AcrPull"
#   principal_id                     = azurerm_kubernetes_cluster.aks-prd.kubelet_identity.0.object_id
#   skip_service_principal_aad_check = true
# }

