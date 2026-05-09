terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "7.22.0"
    }
  }
}

provider "google" {
  credentials = file("./credentials/gc-dk.json")

  project = var.gcp_project
  region  = "us-east1"
  zone    = "us-east1-c"
}