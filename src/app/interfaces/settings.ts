export interface Settings {
  loxberryIP?: string,  // IP address only: 192.168.1.1
  loxberryUrl?: string, // Full url: http://192.168.1.1:3030
  loxberryAuthPort?: string,
  loxberryUsername?: string,
  accessToken?: string,
  refreshToken?: string,
  mqttIP?: string,
  mqttUsername?: string,
  mqttPW?: string,
  mqttPort?: string,
  mqttTopicPrefix?: string,
  darkTheme?: boolean
}
