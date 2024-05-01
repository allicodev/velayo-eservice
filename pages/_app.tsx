import type { AppProps } from "next/app";
import "reflect-metadata";

import "@/styles/globals.css";
import "@/styles//main.styles.css";
import { ConfigProvider } from "antd";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "abel",
        },
        components: {
          Tree: {
            titleHeight: 25,
            nodeSelectedBg: "#98c04b",
          },
        },
      }}
    >
      <Head>
        <link rel="shortcut icon" href="/logo-2.png" />
        <title>VELAYO E-Service</title>
        <meta
          name="description"
          content="A Web System that helps to assist and provide service for walk-in client on different branches"
        />
      </Head>
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
