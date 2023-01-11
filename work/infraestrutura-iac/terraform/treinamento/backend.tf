terraform {
  backend "azurerm" {
    resource_group_name  = "#{state_rg_name}#"
    storage_account_name = "#{state_stg_name}#"
    container_name       = "treinamento"
    key                  = "terraform.tfstate"
    tenant_id            = "#{tenant_id}#"
    subscription_id      = "#{subscription_id}#"
    access_key           = "#{state_stg_access_key}#"
  }
}

