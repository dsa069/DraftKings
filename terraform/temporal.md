GOOGLE_APPLICATION_CREDENTIALS="$PWD/credentials/gc-dk.json" terraform init -backend-config="prefix=terraform/state/dev"  
GOOGLE_APPLICATION_CREDENTIALS="$PWD/credentials/gc-dk.json" terraform workspace select dev
GOOGLE_APPLICATION_CREDENTIALS="$PWD/credentials/gc-dk.json" terraform apply -auto-approve   
GOOGLE_APPLICATION_CREDENTIALS="$PWD/credentials/gc-dk.json" terraform destroy \
  -var="gcp_project=cnsa-2026" \
  -var="dns_managed_zone=cnsa-2026-dsa069-dns" \
  -var="prefix_name=dk-corba-dev" \
  -var="dns_name=dk-corba-dev.cnsa-2026-dsa069.tech."