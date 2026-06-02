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

variable "prefix_name" {
  description = "Prefijo para el nombre de la instancia de Compute Engine"
  type        = string
  default = "dk-corba-dev"
}

variable "dns_name" {
  description = "Nombre del registro DNS"
  type        = string
  default = "dk-corba-dev.cnsa-2026-dsa069.tech."
}

