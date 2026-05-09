variable "gcp_project" {
  description = "GCP project"
}

variable "dns_managed_zone" {
  description = "Cloud DNS managed zone name (not the FQDN)"
  type        = string
}