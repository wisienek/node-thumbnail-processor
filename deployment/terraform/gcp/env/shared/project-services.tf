module "project-services" {
  source  = "terraform-google-modules/project-factory/google//modules/project_services"
  version = "~> 15.0"

  project_id = local.project

  activate_apis = [
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com",
    "compute.googleapis.com",
    "cloudscheduler.googleapis.com",
    "storage-api.googleapis.com",
    "run.googleapis.com",
  ]
}
