import "@/styles/globals.css";
// Web3Onboard는 dApp 개발자가 여러 가지 지갑 연결을 쉽게 설정하고 관리할 수 있도록 도와주는 라이브러리
// Web3OnboardProvider는 Web3Onboard 라이브러리 내에서 제공되는 기능.
import { Web3OnboardProvider, init } from '@web3-onboard/react'
import walletConnectModule from "@web3-onboard/walletconnect";
// 메타마스크 연결을 위한 라이브러리
import injectedModule from "@web3-onboard/injected-wallets"; 

//https://docs.walletconnect.com/walletkit/web/cloud/relay#project-id
const walletConnect = walletConnectModule({
  projectId: '832580820193ff6bae62a15dc0feff03',
  version: 2,
  dappUrl: 'https://buymeacoffee-wheat.vercel.app/',
  requiredChains: [1001],
});
const injected = injectedModule();

const KLAYTN_MAINNET_URL = "https://public-en-cypress.klaytn.net";
const KLAYTN_BAOBAB_URL = "https://public-en-baobab.klaytn.net";
  const web3Onboard =  init({
    wallets: [injected, walletConnect],
    chains: [
      {
        id: "0x2019",
        token: "KLAY",
        namespace: "evm",
        label: "Klaytn Mainnet",
        rpcUrl: KLAYTN_MAINNET_URL
      },
      {
        id: "0x3e9",
        token: "KLAY",
        namespace: "evm",
        label: "Klaytn Testnet",
        rpcUrl: KLAYTN_BAOBAB_URL
      },
    ],
    appMetadata: {
      name: "BUY ME A COFFEE", // change to your dApp name
    // icon: "paste your icon url",  // <-이거 지우면 로고 엑박뜨는거 해결
    // logo: "paste your logo url", // <-이거 지우면 로고 엑박뜨는거 해결
      description: "BuyMeACoffee는 Klaytn Baobab Network 기반의 DApp으로, 사용자가 커피를 구매하고 메시지를 남길 수 있으며, 소유자는 기부금을 인출할 수 있습니다. 또한, 새 커피 구매 시 디스코드 알림을 보냅니다.",
      recommendedInjectedWallets: [
        { name: "MetaMask", url: "https://metamask.io" },
      ]
    }
  })
export default function App({ Component, pageProps }) {
  return (
    <Web3OnboardProvider web3Onboard={web3Onboard}>
      <Component {...pageProps} />
    </Web3OnboardProvider>
 )
}
