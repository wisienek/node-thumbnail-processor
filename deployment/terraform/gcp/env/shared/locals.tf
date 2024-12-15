locals {
  # Project
  project = "dauntless-drive-374111"
  region  = "europe-central2"
  labels = {
    env       = "shared"
    version   = 1
  }

  envs = ["dev", "stage", "prod"]

  # Artifact registry
  gcr_repositories = [
    "cf"
  ]
  image_timeout = 10 * 24 * 3600
  keep_last_no_images = 3

}
