variable "enabled" {
  description = "Enable or disable node-local-dns Helm release."
  type        = bool
  default     = true
}

variable "release_name" {
  description = "Helm release name."
  type        = string
  default     = "node-local-dns"
}

variable "namespace" {
  description = "Namespace where node-local-dns will be installed."
  type        = string
  default     = "kube-system"
}

variable "create_namespace" {
  description = "Create namespace if it does not exist."
  type        = bool
  default     = false
}

variable "chart_repository" {
  description = "DeliveryHero Helm repository. For OCI use oci://ghcr.io/deliveryhero/helm-charts."
  type        = string
  default     = "oci://ghcr.io/deliveryhero/helm-charts"
}

variable "chart_name" {
  description = "Helm chart name."
  type        = string
  default     = "node-local-dns"
}

variable "chart_version" {
  description = "Chart version. Example: 2.8.0."
  type        = string
  default     = null
}

variable "min_replicas" {
  description = "Compatibility variable requested by the module interface. This chart deploys a DaemonSet and does not use replicas."
  type        = number
  default     = 1
}

variable "max_replicas" {
  description = "Compatibility variable requested by the module interface. This chart deploys a DaemonSet and does not use replicas."
  type        = number
  default     = 1
}

variable "dnsserver" {
  description = "Main CoreDNS/kube-dns service IP used by node-local-dns. Maps to config.dnsServer."
  type        = string
  default     = "172.20.0.10"
}

variable "localdbs" {
  description = "Local DNS IP used by node-local-dns. Maps to config.localDns. Kept as localdbs because it was requested with this name."
  type        = string
  default     = "169.254.20.25"
}

variable "resources" {
  description = "Resources map applied to the node-cache container."
  type        = any
  default = {
    requests = {
      cpu    = "25m"
      memory = "128Mi"
    }
    limits = {
      memory = "128Mi"
    }
  }
}

variable "tolerations" {
  description = "Tolerations list/map applied to node-local-dns pods."
  type        = any
  default = [
    {
      key      = "CriticalAddonsOnly"
      operator = "Exists"
    },
    {
      effect   = "NoExecute"
      operator = "Exists"
    },
    {
      effect   = "NoSchedule"
      operator = "Exists"
    }
  ]
}

variable "image_repository" {
  description = "Node-local-dns image repository."
  type        = string
  default     = "registry.k8s.io/dns/k8s-dns-node-cache"
}

variable "image_tag" {
  description = "Image tag. Empty string uses chart appVersion."
  type        = string
  default     = ""
}

variable "dns_domain" {
  description = "Kubernetes DNS domain."
  type        = string
  default     = "cluster.local"
}

variable "bind_ip" {
  description = "If true, bind only dnsServer and localDns. If false, bind 0.0.0.0."
  type        = bool
  default     = false
}

variable "comm_protocol" {
  description = "DNS communication protocol. Valid options usually are prefer_udp or force_tcp."
  type        = string
  default     = "force_tcp"
}

variable "enable_logging" {
  description = "Enable DNS query logging."
  type        = bool
  default     = false
}

variable "no_ipv6_lookups" {
  description = "Return NOERROR for IPv6 lookups when enabled."
  type        = bool
  default     = false
}

variable "prefetch" {
  description = "CoreDNS cache prefetch configuration."
  type        = any
  default = {
    enabled    = false
    amount     = 3
    duration   = "30s"
    percentage = "20%"
  }
}

variable "health_port" {
  description = "Health endpoint port."
  type        = number
  default     = 8080
}

variable "setup_interface" {
  type    = bool
  default = true
}

variable "setup_iptables" {
  type    = bool
  default = true
}

variable "skip_teardown" {
  type    = bool
  default = false
}

variable "extra_server_blocks" {
  type    = string
  default = ""
}

variable "custom_config" {
  type    = string
  default = ""
}

variable "upstream_servers" {
  type    = string
  default = "__PILLAR__UPSTREAM__SERVERS__"
}

variable "upstream_forward_config" {
  type    = any
  default = {}
}

variable "upstream_service_selector" {
  type = any
  default = {
    k8s-app = "kube-dns"
  }
}

variable "custom_upstreamsvc" {
  type    = string
  default = ""
}

variable "service_monitor" {
  description = "serviceMonitor values map."
  type        = any
  default = {
    enabled             = false
    labels              = {}
    path                = "/metrics"
    honorLabels         = false
    metricRelabelings   = []
    relabelings         = []
    namePrefix          = ""
    prometheusNamespace = "kube-system"
  }
}

variable "prometheus_scraping_enabled" {
  type    = bool
  default = true
}

variable "dashboard" {
  type = any
  default = {
    enabled     = false
    namespace   = "kube-system"
    label       = "grafana_dashboard"
    annotations = {}
  }
}

variable "update_strategy" {
  type = any
  default = {
    type = "RollingUpdate"
    rollingUpdate = {
      maxUnavailable = "10%"
    }
  }
}

variable "affinity" {
  type    = any
  default = {}
}

variable "pod_annotations" {
  type    = any
  default = {}
}

variable "pod_labels" {
  type    = any
  default = {}
}

variable "service_account" {
  type = any
  default = {
    create      = true
    annotations = {}
    name        = ""
  }
}

variable "service" {
  type = any
  default = {
    annotations = {}
  }
}

variable "timeout" {
  type    = number
  default = 300
}

variable "atomic" {
  type    = bool
  default = true
}

variable "cleanup_on_fail" {
  type    = bool
  default = true
}

variable "wait" {
  type    = bool
  default = true
}

variable "dependency_update" {
  type    = bool
  default = false
}
