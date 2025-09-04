// src/pages/_app.tsx
import type { AppProps } from "next/app";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";  // ✅ default import

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Navbar />
      <main>
        <Component {...pageProps} />
      </main>
      <Footer />   {/* ✅ will render */}
    </>
  );
}

export default MyApp;
