resource "helm_release" "this" {
  count = var.enabled ? 1 : 0

  name             = var.release_name
  namespace        = var.namespace
  create_namespace = var.create_namespace

  repository = var.chart_repository
  chart      = var.chart_name
  version    = var.chart_version

  values = [
    templatefile("${path.module}/templates/values.yaml", local.values)
  ]

  timeout          = var.timeout
  atomic           = var.atomic
  cleanup_on_fail  = var.cleanup_on_fail
  wait             = var.wait
  dependency_update = var.dependency_update
}
