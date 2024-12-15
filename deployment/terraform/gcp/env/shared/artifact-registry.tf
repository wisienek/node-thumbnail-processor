resource "google_artifact_registry_repository" "repositories" {
  provider = google-beta
  count = length(local.gcr_repositories)
  location = local.region

  repository_id          = local.gcr_repositories[count.index]
  format                 = "DOCKER"
  cleanup_policy_dry_run = false

  # Delete old repositories
  cleanup_policies {
    id     = "delete-old"
    action = "DELETE"

    condition {
      tag_state  = "UNTAGGED"
      older_than = "${local.image_timeout}s"
    }
  }

  # ^ But keep tagged ones
  cleanup_policies {
    id     = "keep-tagged-release"
    action = "KEEP"

    condition {
      tag_state = "TAGGED"
      tag_prefixes = ["release"]
      package_name_prefixes = local.envs
    }
  }

  # ^ But only last 10
  cleanup_policies {
    id     = "keep-minimum-versions"
    action = "KEEP"

    most_recent_versions {
      package_name_prefixes = local.envs
      keep_count            = local.keep_last_no_images
    }
  }

  labels = merge(local.labels, {
    component           = "repository"
    data-classification = "internal-only"
  })
}

#---------#
# Members #
#---------#

resource "google_project_iam_member" "gcr_repository_admin" {
  role    = "roles/artifactregistry.repoAdmin"
  member  = "serviceAccount:${google_service_account.pipeline_user.email}"
  project = local.project
}
