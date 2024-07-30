// import coinbaseWalletModule from "@web3-onboard/coinbase";
// import walletConnectModule from "@web3-onboard/walletconnect";
// const coinbaseWalletSdk = coinbaseWalletModule();
// const walletConnect = walletConnectModule();

import "@/styles/globals.css";
// Web3Onboard는 dApp 개발자가 여러 가지 지갑 연결을 쉽게 설정하고 관리할 수 있도록 도와주는 라이브러리
// Web3OnboardProvider는 Web3Onboard 라이브러리 내에서 제공되는 기능.
import { Web3OnboardProvider, init } from '@web3-onboard/react'

// 메타마스크 연결을 위한 라이브러리
import injectedModule from "@web3-onboard/injected-wallets"; 

const injected = injectedModule();
const modules = [injected];

const ETH_MAINNET_RPC_URL = `https://ethereum-mainnet-rpc.allthatnode.com/1d322388ZEPI2cs0OHloJ6seI4Wfy36N`;
const KLAYTN_MAINNET_URL = `https://klaytn-mainnet-rpc.allthatnode.com:8551/1d322388ZEPI2cs0OHloJ6seI4Wfy36N`;
const KLAYTN_BAOBAB_URL = `https://klaytn-baobab-rpc.allthatnode.com:8551/1d322388ZEPI2cs0OHloJ6seI4Wfy36N`;

  // web3Onboard의 기능.
  // 여기서 작성하고 59번줄에서 세팅.
  const web3Onboard =  init({
    wallets: modules,
    chains: [
      {
        id: "0x1", // chain ID must be in hexadecimal
        token: "ETH",
        namespace: "evm",
        label: "Ethereum Mainnet",
        rpcUrl: ETH_MAINNET_RPC_URL
      },
      {
        id: "0x2019", // chain ID must be in hexadecimal
        token: "KLAY",
        namespace: "evm",
        label: "Klaytn Mainnet",
        rpcUrl: KLAYTN_MAINNET_URL
      },
      {
        id: "0x3e9", // chain ID must be in hexadecimel
        token: "KLAY",
        namespace: "evm",
        label: "Klaytn Testnet",
        rpcUrl: KLAYTN_BAOBAB_URL
      },
     // you can add as much supported chains as possible
    ],
    appMetadata: {
      name: "Klaytn-web3-onboard-App", // change to your dApp name
      icon: "paste your icon url",
      logo: "paste your logo url",
      description: "Web3Onboard-Klaytn",
      recommendedInjectedWallets: [
        { name: "Coinbase", url: "https://wallet.coinbase.com/" },
        { name: "MetaMask", url: "https://metamask.io" }
      ]
    }
  })
export default function App({ Component, pageProps }) {
  return (
    // Web3Onboar의 기능을 쓸 수 있게끔 Web3OnboardProvider로 감싸주서
    // 애플리케이션 내의 모든 컴포넌트가 Web3Onboard 설정과 기능을 사용할 수 있도록 한다.
    <Web3OnboardProvider web3Onboard={web3Onboard}>
      {/* index.js 실행 */}
      <Component {...pageProps} /> 
    </Web3OnboardProvider>
 )
}
