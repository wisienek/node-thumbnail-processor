locals {
  name  = "image-processor-${var.env}"
  image = "${var.region}-docker.pkg.dev/${var.project}/cf/image-processor:${var.env}"

  max_retries = 1
  timeout     = "900s"
  cpu         = "1" # 1/2/4/8 (4cpu = min 2Gi mem)
  memory_size = "1Gi"
}
