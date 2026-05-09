# Para mas detalles (opocional): export TF_LOG=TRACE


# Create the mynetwork network
resource "google_compute_network" "mynetwork" {
  name                    = "draftkings-tf"
  auto_create_subnetworks = "true"
  project                 = var.gcp_project
}

# Add a firewall rule to allow HTTP, SSH, RDP, and ICMP traffic on mynetwork
resource "google_compute_firewall" "mynetwork-allow-http-ssh-rdp-icmp" {
  name    = "draftkings-tf-allow-http-ssh-rdp-icmp"
  network = google_compute_network.mynetwork.name
  allow {
    protocol = "tcp"
    ports    = ["22", "80", "8080"]
  }
  
  # firewall will apply  to traffic that has source IP address in these ranges, any IP: 0.0.0.0/0
  source_ranges = ["0.0.0.0/0"]   

  allow {
    protocol = "icmp"
  }
}

# Create the corba-deploy-vm" instance
module "corba-deploy-vm" {
  source          = "./instance"
  instance_name   = "corba-deploy-vm-tf"
  instance_region = "us-east1"
  instance_zone   = "us-east1-c"
  instance_type   = "e2-medium"
  image           = "ubuntu-os-cloud/ubuntu-2204-lts"  #ubuntu-2204-lts"  
  #  startup_script      = "${var.init_scrip_apache2}"
  instance_subnetwork = google_compute_network.mynetwork.self_link
}

resource "null_resource" "provision-deploy-vm" {

  provisioner "remote-exec" {
    connection {
      host        = module.corba-deploy-vm.instance_ip_addr
      type        = "ssh"
      user        = "ubuntu"
      private_key = file("${path.module}/credentials/ssh/id_ed25519")
    }

    ## Script inicialización corba-deploy-vm
    inline = [
      "sudo apt-get update -y"
    ]
    on_failure = continue
  }
  depends_on = [
    # Init script must be created before this IP address could
    # actually be used, otherwise the services will be unreachable.
    module.corba-deploy-vm.instance_ip_addr
  ]
}

# Registro A que apunta automáticamente el dominio a la IP estática de la VM
resource "google_dns_record_set" "corba_deploy_vm" {
  name         = "dk-corba-dev.cnsa-2026-dsa069.tech."
  managed_zone = var.dns_managed_zone
  project      = var.gcp_project
  type         = "A"
  ttl          = 300
  rrdatas      = [module.corba-deploy-vm.instance_ip_addr]

  depends_on = [
    module.corba-deploy-vm
  ]
}