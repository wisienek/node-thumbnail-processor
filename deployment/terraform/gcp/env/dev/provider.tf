locals {
  env = "dev"

  project = "dauntless-drive-374111"
  region  = "europe-central2"
  labels = {
    env       = local.env
    version   = 3
  }
}

provider "google" {
  project = local.project
  region  = local.region
  credentials = file("credentials.json")
}

provider "google-beta" {
  project = local.project
  region  = local.region
  credentials = file("credentials.json")
}

terraform {
  required_providers {
    aws = {
      version = "= 5.32.1"
    }
    google = {
      source  = "hashicorp/google"
      version = "= 5.41.0"
    }
  }

  backend "gcs" {
    bucket = "infra-state-bucket"
    prefix = "env/dev"
  }
}
