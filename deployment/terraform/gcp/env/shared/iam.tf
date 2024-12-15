# Pipeline user for deployment from Github / gitlab / ...
resource "google_service_account" "pipeline_user" {
  project      = local.project
  account_id   = "pipeline-user"
  display_name = "PipelineUser"
}

resource "google_service_account_key" "pipeline_user_key" {
  service_account_id = google_service_account.pipeline_user.name
}

resource "google_project_iam_member" "pipeline_run_admin" {
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.pipeline_user.email}"
  project = local.project
}

resource "google_project_iam_member" "pipeline_lb_admin" {
  role    = "roles/compute.loadBalancerAdmin"
  member  = "serviceAccount:${google_service_account.pipeline_user.email}"
  project = local.project
}

resource "google_project_iam_member" "pipeline_run_service_agent" {
  role    = "roles/run.serviceAgent"
  member  = "serviceAccount:${google_service_account.pipeline_user.email}"
  project = local.project
}

resource "google_project_iam_member" "pipeline_deployer" {
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${google_service_account.pipeline_user.email}"
  project = local.project
}


# Cloud functions user
resource "google_service_account" "cf_user" {
  project      = local.project
  account_id   = "cloud-functions-user"
  display_name = "Cloud Functions User"
}

resource "google_project_iam_custom_role" "cf_user_role" {
  role_id     = "cloudFunctionsUserRole"
  title       = "Cloud Functions User role"
  description = "Role for Cloud Functions User custom permissions"
  permissions = ["storage.objects.get", "storage.objects.list", "storage.objects.delete"]
}
