variable "gcp_project" {
  description = "GCP project"
}

variable "dns_managed_zone" {
  description = "Cloud DNS managed zone name (not the FQDN)"
  type        = string
}

variable "credentials_file" {
  description = "Ruta al archivo JSON de credenciales de GCP"
  type        = string
  default     = "./credentials/gc-dk.json" # Tu ruta local
}