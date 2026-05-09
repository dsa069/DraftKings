terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "7.22.0"
    }
  }
    backend "gcs" {
    bucket  = "dk-tfstate-corba-dev"
    prefix  = "terraform/state"
  }
}

provider "google" {
  project     = var.gcp_project
  region      = "us-east1"
  # Usamos la variable en lugar de una ruta fija
  credentials = file(var.credentials_file)
}