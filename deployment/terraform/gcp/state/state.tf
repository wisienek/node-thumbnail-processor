provider "google" {
  project = "dauntless-drive-374111"
  region  = "europe-central2"
  credentials = file("credentials.json")
}

provider "google-beta" {
  project = "dauntless-drive-374111"
  region  = "europe-central2"
  credentials = file("credentials.json")
}

resource "google_storage_bucket" "state_bucket" {
  name     = "infra-state-bucket"
  location = "EU"

  storage_class = "STANDARD"

  versioning {
    enabled = true
  }

  cors {
    origin = ["*"]
    method = ["GET", "HEAD"]
    response_header = ["*"]
    max_age_seconds = 3600
  }

  lifecycle_rule {
    condition {
      days_since_noncurrent_time = 1
    }
    action {
      type = "Delete"
    }
  }
}

resource "google_storage_bucket_iam_member" "state_public_access" {
  provider = google
  bucket   = google_storage_bucket.state_bucket.name
  role     = "roles/storage.objectViewer"
  member   = "allUsers"
}
