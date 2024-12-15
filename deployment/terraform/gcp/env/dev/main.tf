data "google_project" "current" {}

module "image-processor-cf" {
  source = "../../modules/image-processor-cf"
  env = local.env
  project = local.project
  region = local.region
  labels = local.labels

  MONGO_URI = var.MONGO_URI
  APP_CONFIG = {
    DEFAULT_BATCH_SIZE = 20
    READER_TYPE       = "CSV"
    FILE_PATH         = "./data/data.csv"
    THUMBNAIL_WIDTH   = 100
    THUMBNAIL_HEIGHT  = 100
  }
}
