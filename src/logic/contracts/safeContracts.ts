import { AbiItem } from 'web3-utils'
import GnosisSafeSol from '@gnosis.pm/safe-contracts/build/contracts/GnosisSafe.json'
import ProxyFactorySol from '@gnosis.pm/safe-contracts/build/contracts/GnosisSafeProxyFactory.json'
import Web3 from 'web3'

import { ETHEREUM_NETWORK } from 'src/config/networks/network.d'
import { ZERO_ADDRESS } from 'src/logic/wallets/ethAddresses'
import { calculateGasOf, EMPTY_DATA } from 'src/logic/wallets/ethTransactions'
import { getWeb3, getNetworkIdFrom } from 'src/logic/wallets/getWeb3'
import { GnosisSafe } from 'src/types/contracts/GnosisSafe.d'
import { GnosisSafeProxyFactory } from 'src/types/contracts/GnosisSafeProxyFactory.d'
import { AllowanceModule } from 'src/types/contracts/AllowanceModule.d'
import { getSafeInfo, SafeInfo } from 'src/logic/safe/utils/safeInformation'
import {
  SPENDING_LIMIT_MODULE_ADDRESS,
  REACT_APP_SAFE_MASTER_COPY_ADDRESS,
  REACT_APP_MULTI_SEND_ADDRESS,
  REACT_APP_DEFAULT_FALLBACK_HANDLER_ADDRESS,
} from 'src/utils/constants'

import SpendingLimitModule from './artifacts/AllowanceModule.json'

export const SENTINEL_ADDRESS = '0x0000000000000000000000000000000000000001'

export const DEFAULT_FALLBACK_HANDLER_ADDRESS = REACT_APP_DEFAULT_FALLBACK_HANDLER_ADDRESS
export const MULTI_SEND_ADDRESS = REACT_APP_MULTI_SEND_ADDRESS
export const SAFE_MASTER_COPY_ADDRESS = REACT_APP_SAFE_MASTER_COPY_ADDRESS

let proxyFactoryMaster: GnosisSafeProxyFactory
let safeMaster: GnosisSafe

/**
 * Creates a Contract instance of the GnosisSafe contract
 * @param {Web3} web3
 * @param {ETHEREUM_NETWORK} networkId
 */
export const getGnosisSafeContract = (web3: Web3, networkId: ETHEREUM_NETWORK) => {
  const networks = GnosisSafeSol.networks
  // TODO: this may not be the most scalable approach,
  //  but up until v1.2.0 the address is the same for all the networks.
  //  So, if we can't find the network in the Contract artifact, we fallback to MAINNET.
  const contractAddress = SAFE_MASTER_COPY_ADDRESS
  return (new web3.eth.Contract(GnosisSafeSol.abi as AbiItem[], contractAddress) as unknown) as GnosisSafe
}

/**
 * Creates a Contract instance of the GnosisSafeProxyFactory contract
 * @param {Web3} web3
 * @param {ETHEREUM_NETWORK} networkId
 */
const getProxyFactoryContract = (web3: Web3, networkId: ETHEREUM_NETWORK): GnosisSafeProxyFactory => {
  const networks = ProxyFactorySol.networks
  // TODO: this may not be the most scalable approach,
  //  but up until v1.2.0 the address is the same for all the networks.
  //  So, if we can't find the network in the Contract artifact, we fallback to MAINNET.
  const contractAddress = process.env.REACT_APP_SAFE_PROXY_FACTORY_ADDRESS
  return (new web3.eth.Contract(ProxyFactorySol.abi as AbiItem[], contractAddress) as unknown) as GnosisSafeProxyFactory
}

export const getMasterCopyAddressFromProxyAddress = async (proxyAddress: string): Promise<string | undefined> => {
  const res = await getSafeInfo(proxyAddress)
  const masterCopyAddress = (res as SafeInfo)?.implementation.value
  if (!masterCopyAddress) {
    console.error(`There was not possible to get masterCopy address from proxy ${proxyAddress}.`)
    return
  }
  return masterCopyAddress
}

export const instantiateSafeContracts = async () => {
  const web3 = getWeb3()
  const networkId = await getNetworkIdFrom(web3)

  // Create ProxyFactory Master Copy
  proxyFactoryMaster = getProxyFactoryContract(web3, networkId)

  // Create Safe Master copy
  safeMaster = getGnosisSafeContract(web3, networkId)
}

export const getSafeMasterContract = async () => {
  await instantiateSafeContracts()
  return safeMaster
}

export const getSafeDeploymentTransaction = (
  safeAccounts: string[],
  numConfirmations: number,
  safeCreationSalt: number,
) => {
  const gnosisSafeData = safeMaster.methods
    .setup(
      safeAccounts,
      numConfirmations,
      ZERO_ADDRESS,
      EMPTY_DATA,
      DEFAULT_FALLBACK_HANDLER_ADDRESS,
      ZERO_ADDRESS,
      0,
      ZERO_ADDRESS,
    )
    .encodeABI()
  return proxyFactoryMaster.methods.createProxyWithNonce(safeMaster.options.address, gnosisSafeData, safeCreationSalt)
}

export const estimateGasForDeployingSafe = async (
  safeAccounts: string[],
  numConfirmations: number,
  userAccount: string,
  safeCreationSalt: number,
) => {
  const gnosisSafeData = safeMaster.methods
    .setup(
      safeAccounts,
      numConfirmations,
      ZERO_ADDRESS,
      EMPTY_DATA,
      DEFAULT_FALLBACK_HANDLER_ADDRESS,
      ZERO_ADDRESS,
      0,
      ZERO_ADDRESS,
    )
    .encodeABI()
  const proxyFactoryData = proxyFactoryMaster.methods
    .createProxyWithNonce(safeMaster.options.address, gnosisSafeData, safeCreationSalt)
    .encodeABI()
  return calculateGasOf({
    data: proxyFactoryData,
    from: userAccount,
    to: proxyFactoryMaster.options.address,
  }).then((value) => value * 2)
}

export const getGnosisSafeInstanceAt = (safeAddress: string): GnosisSafe => {
  const web3 = getWeb3()
  return (new web3.eth.Contract(GnosisSafeSol.abi as AbiItem[], safeAddress) as unknown) as GnosisSafe
}

/**
 * Creates a Contract instance of the SpendingLimitModule contract
 */
export const getSpendingLimitContract = () => {
  const web3 = getWeb3()

  return (new web3.eth.Contract(
    SpendingLimitModule.abi as AbiItem[],
    SPENDING_LIMIT_MODULE_ADDRESS,
  ) as unknown) as AllowanceModule
}
