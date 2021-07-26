import FantomLogo from 'src/config/assets/token_ftm.svg'
import { EnvironmentSettings, ETHEREUM_NETWORK, NetworkConfig } from 'src/config/networks/network.d'

const baseConfig: EnvironmentSettings = {
  //clientGatewayUrl: 'https://safe.testnet.fantom.network/v1',
  //txServiceUrl: 'https://safe.testnet.fantom.network/api/v1',
  clientGatewayUrl: 'http://localhost:9005/v1',
  txServiceUrl: 'http://localhost:9000/api/v1',
  safeUrl: 'https://safe.testnet.fantom.network/app',
  safeAppsUrl: '',
  gasPriceOracle: {
    url: 'https://xapi.fantom.network/json/gas',
    gasParameter: 'average',
    gweiFactor: '1e8',
  },
  rpcServiceUrl: 'https://rpcapi-tracing.testnet.fantom.network',
  networkExplorerName: 'FTMScan testnet',
  networkExplorerUrl: 'https://testnet.ftmscan.com',
  networkExplorerApiUrl: 'https://api.testnet.ftmscan.com/api',
}

const ftmtestnet: NetworkConfig = {
  environment: {
    dev: {
      ...baseConfig,
    },
    production: {
      ...baseConfig,
    },
  },
  network: {
    id: ETHEREUM_NETWORK.FTMTESTNET,
    backgroundColor: '#3C85E8',
    textColor: '#ffffff',
    label: 'Fantom testnet',
    isTestNet: true,
    nativeCoin: {
      address: '0x0000000000000000000000000000000000000000',
      name: 'Fantom',
      symbol: 'FTM',
      decimals: 18,
      logoUri: FantomLogo,
    },
  },
}

export default ftmtestnet
