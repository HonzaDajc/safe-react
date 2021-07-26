import semverSatisfies from 'semver/functions/satisfies'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import GnosisSafeSol from '@gnosis.pm/safe-contracts/build/contracts/GnosisSafe.json'
import ProxyFactorySol from '@gnosis.pm/safe-contracts/build/contracts/GnosisSafeProxyFactory.json'
import DefaultCallbackHandlerSol from '@gnosis.pm/safe-contracts/build/contracts/DefaultCallbackHandler.json'
import MultiSendSol from '@gnosis.pm/safe-contracts/build/contracts/MultiSend.json'

import { ETHEREUM_NETWORK } from 'src/config/networks/network.d'
import { ZERO_ADDRESS } from 'src/logic/wallets/ethAddresses'
import { calculateGasOf, EMPTY_DATA } from 'src/logic/wallets/ethTransactions'
import { getWeb3, getNetworkIdFrom } from 'src/logic/wallets/getWeb3'
import { GnosisSafe } from 'src/types/contracts/GnosisSafe.d'
import { GnosisSafeProxyFactory } from 'src/types/contracts/GnosisSafeProxyFactory.d'
import { FallbackManager } from 'src/types/contracts/FallbackManager.d'
import { MultiSend } from 'src/types/contracts/MultiSend.d'
import { getSafeInfo, SafeInfo } from 'src/logic/safe/utils/safeInformation'
import {
  REACT_APP_SAFE_MASTER_COPY_ADDRESS,
  REACT_APP_MULTI_SEND_ADDRESS,
  REACT_APP_DEFAULT_FALLBACK_HANDLER_ADDRESS,
  REACT_APP_SAFE_PROXY_FACTORY_ADDRESS,
} from 'src/utils/constants'

export const SENTINEL_ADDRESS = '0x0000000000000000000000000000000000000001'
export const DEFAULT_FALLBACK_HANDLER_ADDRESS = REACT_APP_DEFAULT_FALLBACK_HANDLER_ADDRESS
export const MULTI_SEND_ADDRESS = REACT_APP_MULTI_SEND_ADDRESS
export const SAFE_MASTER_COPY_ADDRESS = REACT_APP_SAFE_MASTER_COPY_ADDRESS
export const SAFE_PROXY_FACTORY_ADDRESS = REACT_APP_SAFE_PROXY_FACTORY_ADDRESS

let proxyFactoryMaster: GnosisSafeProxyFactory
let safeMaster: GnosisSafe
let fallbackHandler: FallbackManager
let multiSend: MultiSend

/**
 * Creates a Contract instance of the GnosisSafe contract
 * @param {Web3} web3
 * @param {ETHEREUM_NETWORK} networkId
 */
const getGnosisSafeContractInstance = (web3: Web3, networkId: ETHEREUM_NETWORK): GnosisSafe => {
  const contractAddress = SAFE_MASTER_COPY_ADDRESS
  return new web3.eth.Contract(GnosisSafeSol?.abi as AbiItem[], contractAddress) as unknown as GnosisSafe
}

/**
 * Creates a Contract instance of the GnosisSafeProxyFactory contract
 * @param {Web3} web3
 * @param {ETHEREUM_NETWORK} networkId
 */
const getProxyFactoryContractInstance = (web3: Web3, networkId: ETHEREUM_NETWORK): GnosisSafeProxyFactory => {
  const contractAddress = SAFE_PROXY_FACTORY_ADDRESS
  return new web3.eth.Contract(ProxyFactorySol?.abi as AbiItem[], contractAddress) as unknown as GnosisSafeProxyFactory
}

/**
 * Creates a Contract instance of the FallbackHandler contract
 * @param {Web3} web3
 * @param {ETHEREUM_NETWORK} networkId
 */
const getFallbackHandlerContractInstance = (web3: Web3, networkId: ETHEREUM_NETWORK): FallbackManager => {
  const contractAddress = DEFAULT_FALLBACK_HANDLER_ADDRESS
  return new web3.eth.Contract(
    DefaultCallbackHandlerSol?.abi as AbiItem[],
    contractAddress,
  ) as unknown as FallbackManager
}

/**
 * Creates a Contract instance of the MultiSend contract
 * @param {Web3} web3
 * @param {ETHEREUM_NETWORK} networkId
 */
const getMultiSendContractInstance = (web3: Web3, networkId: ETHEREUM_NETWORK): MultiSend => {
  const contractAddress = MULTI_SEND_ADDRESS
  return new web3.eth.Contract(MultiSendSol?.abi as AbiItem[], contractAddress) as unknown as MultiSend
}

export const getMasterCopyAddressFromProxyAddress = async (proxyAddress: string): Promise<string | undefined> => {
  let masterCopyAddress: string | undefined
  try {
    const res = await getSafeInfo(proxyAddress)
    masterCopyAddress = (res as SafeInfo)?.implementation.value
    if (!masterCopyAddress) {
      console.error(`There was not possible to get masterCopy address from proxy ${proxyAddress}.`)
    }
  } catch (e) {
    e.log()
  }
  return masterCopyAddress
}

export const instantiateSafeContracts = async () => {
  const web3 = getWeb3()
  const networkId = await getNetworkIdFrom(web3)

  // Create ProxyFactory Master Copy
  proxyFactoryMaster = getProxyFactoryContractInstance(web3, networkId)

  // Create Safe Master copy
  safeMaster = getGnosisSafeContractInstance(web3, networkId)

  // Create Fallback Handler
  fallbackHandler = getFallbackHandlerContractInstance(web3, networkId)

  // Create MultiSend contract
  multiSend = getMultiSendContractInstance(web3, networkId)
}

export const getSafeMasterContract = async () => {
  await instantiateSafeContracts()
  return safeMaster
}

export const getSafeMasterContractAddress = () => {
  return safeMaster.options.address
}

export const getFallbackHandlerContractAddress = () => {
  return fallbackHandler.options.address
}

export const getMultisendContract = () => {
  return multiSend
}

export const getMultisendContractAddress = () => {
  return multiSend.options.address
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
      fallbackHandler.options.address,
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
  const proxyFactoryData = getSafeDeploymentTransaction(safeAccounts, numConfirmations, safeCreationSalt).encodeABI()

  return calculateGasOf({
    data: proxyFactoryData,
    from: userAccount,
    to: proxyFactoryMaster.options.address,
  }).then((value) => value * 2)
}

export const getGnosisSafeInstanceAt = (safeAddress: string, safeVersion: string): GnosisSafe => {
  const web3 = getWeb3()
  return new web3.eth.Contract(GnosisSafeSol?.abi as AbiItem[], safeAddress) as unknown as GnosisSafe
}
