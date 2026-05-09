output "hostname_corba" {
  value = module.corba-deploy-vm.instance_name
}

output "public_ip_corba" {
  value = module.corba-deploy-vm.instance_ip_addr
}