# grpc-node-benchmark-driver
This GRPC Node.js QPS driver provides more ways to customize benchmark, including profiling and HDR histogram file genertaion.

### Usage
```
git clone https://github.com/kprakasam/grpc-node-benchmark-driver.git
npm install
node ./qps_client  --address=localhost:8080 --server_payload=4096 --client_payload=1024 --static_client
```
