import FantomLogo from 'src/config/assets/token_ftm.svg'
import { EnvironmentSettings, ETHEREUM_NETWORK, NetworkConfig } from 'src/config/networks/network.d'

const baseConfig: EnvironmentSettings = {
  clientGatewayUrl: 'https://safe.fantom.network/v1',
  txServiceUrl: 'https://safe.fantom.network/api/v1',
  safeAppsUrl: '',
  gasPriceOracle: {
    url: 'https://xapi.fantom.network/json/gas',
    gasParameter: 'average',
  },
  rpcServiceUrl: 'https://rpcapi-tracing.fantom.network',
  networkExplorerName: 'FTM Scan',
  networkExplorerUrl: 'https://ftmscan.com',
  networkExplorerApiUrl: 'https://api.ftmscan.com/api',
}

const fantom: NetworkConfig = {
  environment: {
    dev: {
      ...baseConfig,
    },
    production: {
      ...baseConfig,
    },
  },
  network: {
    id: ETHEREUM_NETWORK.FANTOM,
    backgroundColor: '#3C85E8',
    textColor: '#ffffff',
    label: 'Fantom Opera',
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

export default fantom
