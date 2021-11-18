import {
    Account,
    clusterApiUrl,
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction,
} from '@solana/web3.js';
import {Token, TOKEN_PROGRAM_ID} from '@solana/spl-token';
import {TokenSwap, TokenSwapLayout} from '@solana/spl-token-swap';
import {
  DexInstructions,
  Market,
  MARKET_STATE_LAYOUT_V2,
  OpenOrders
} from '@project-serum/serum';

import {
  OneSolProtocol,
  TokenSwapInfo,
  loadAccount,
  realSendAndConfirmTransaction,
  SerumDexMarketInfo,
  Numberu64,
  loadRaydiumAmmInfo,
} from '../src/onesol-protocol';
import {newAccountWithLamports} from './util/new-account-with-lamports';
import {envConfig} from './util/url';
import {sleep} from './util/sleep';
import { BN } from 'bn.js';
import {
  StableSwap
} from "@saberhq/stableswap-sdk"

const tokenSwapProgramPubKey: PublicKey = new PublicKey(
  envConfig.splTokenSwapProgramId,
);
const serumDexProgramPubKey: PublicKey = new PublicKey(
  envConfig.serumDexProgramId,
);
const onesolProtocolProgramId: PublicKey = new PublicKey(
  envConfig.onesolProtocolProgramId,
);

let connection: Connection;
async function getConnection(): Promise<Connection> {
  if (connection) return connection;

  connection = new Connection(envConfig.url, 'recent');
  const version = await connection.getVersion();
  console.log('Connection to cluster established:', envConfig.url, version);
  return connection;
}

export async function loadAllAmmInfos() {
  const connection = new Connection(clusterApiUrl('mainnet-beta'), "recent");
  const version = await connection.getVersion();
  console.log('Connection to cluster established:', envConfig.url, version);

  const ammInfoArray = await OneSolProtocol.loadAllAmmInfos(connection);
  console.log(`ammInfoArray.count: ${ammInfoArray.length}`)
  ammInfoArray.forEach(ammInfo => {
    console.log(JSON.stringify({
      pubkey: ammInfo.pubkey.toBase58(),
      token_a_account: ammInfo.tokenAccountA().toBase58(),
      token_a_mint: ammInfo.tokenMintA().toBase58(),
      token_b_account: ammInfo.tokenAccountB().toBase58(),
      token_b_mint: ammInfo.tokenMintB().toBase58(),
      program_id: ammInfo.programId.toBase58(),
    }));
  });
}

export async function loadSaberStableSwap(address: PublicKey) {
  const connection = new Connection(clusterApiUrl("devnet"), "recent");
  const swapInfo = await StableSwap.load(connection, address);
  console.log(`feeA: ${swapInfo.state.tokenA.adminFeeAccount}, feeB: ${swapInfo.state.tokenB.adminFeeAccount}`);
}

export async function printRaydiumAmmInfo() {
  const address = new PublicKey('DVa7Qmb5ct9RCpaU7UTpSaf3GVMYz17vNVU67XpdCRut');
  const connection = new Connection(clusterApiUrl('mainnet-beta'), 'recent');
  const raydiumInfo = await loadRaydiumAmmInfo({
    connection,
    address,
  });
  raydiumInfo.toKeys().forEach(key => {
    console.log(`${key.pubkey.toBase58()}`)
  });
}