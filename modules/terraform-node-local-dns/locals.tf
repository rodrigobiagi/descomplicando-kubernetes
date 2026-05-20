locals {
  values = {
    image_repository             = var.image_repository
    image_tag                    = var.image_tag
    dns_domain                   = var.dns_domain
    dnsserver                    = var.dnsserver
    localdbs                     = var.localdbs
    custom_upstreamsvc           = var.custom_upstreamsvc
    bind_ip                      = var.bind_ip
    comm_protocol                = var.comm_protocol
    enable_logging               = var.enable_logging
    no_ipv6_lookups              = var.no_ipv6_lookups
    health_port                  = var.health_port
    setup_interface              = var.setup_interface
    setup_iptables               = var.setup_iptables
    skip_teardown                = var.skip_teardown
    extra_server_blocks          = var.extra_server_blocks
    custom_config                = var.custom_config
    upstream_servers             = var.upstream_servers
    prometheus_scraping_enabled  = var.prometheus_scraping_enabled

    upstream_service_selector_yaml = yamlencode(var.upstream_service_selector)
    upstream_forward_config_yaml   = yamlencode(var.upstream_forward_config)
    service_account_yaml           = yamlencode(var.service_account)
    service_yaml                   = yamlencode(var.service)
    pod_annotations_yaml           = yamlencode(var.pod_annotations)
    pod_labels_yaml                = yamlencode(var.pod_labels)
    update_strategy_yaml           = yamlencode(var.update_strategy)
    service_monitor_yaml           = yamlencode(var.service_monitor)
    dashboard_yaml                 = yamlencode(var.dashboard)
    resources_yaml                 = yamlencode(var.resources)
    tolerations_yaml               = yamlencode(var.tolerations)
    affinity_yaml                  = yamlencode(var.affinity)
    prefetch_yaml                  = yamlencode(var.prefetch)
  }
}
