export interface RPCResponse {
  jsonrpc: string,
  id: string,
  result: {
      brokeraddress: string,
      brokerhost: string,
      brokerport: string,
      websocketport: string,
      brokeruser: string,
      brokerpass: string,
      udpinport: string
  }
}
