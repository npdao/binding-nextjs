import "@rainbow-me/rainbowkit/styles.css";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { Chain, goerli } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { Layout } from "@/components/Layout";

const NpChain: Chain = {
  id: 9686,
  name: "9Purple Chain",
  network: "9Purple Chain",
  nativeCurrency: {
    symbol: "NPC",
    decimals: 18,
    name: "NPC",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.9purple.co/"],
    },
    public: {
      http: ["https://rpc.9purple.co/"],
    },
  },
  testnet: false,
};

const { chains, provider } = configureChains(
  [NpChain],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "NPay Binding Account",
  projectId: "YOUR_PROJECT_ID",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
