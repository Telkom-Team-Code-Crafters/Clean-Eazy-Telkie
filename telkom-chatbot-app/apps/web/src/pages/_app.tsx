// src/pages/_app.tsx
import type { AppProps } from "next/app";
import "leaflet/dist/leaflet.css";
import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";  // ✅ default import
import ReceptionCheckerPage from "../pages/reception"; // ✅ import the ReceptionCheckerPage component

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Navbar />
      <main>
        <Component {...pageProps} />
        <ReceptionCheckerPage/> {/* ✅ will render */}
      </main>
      <Footer />   {/* ✅ will render */}
    </>
  );
}

export default MyApp;
