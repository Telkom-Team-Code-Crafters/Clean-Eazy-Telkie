import Link from "next/link";
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <ul>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/chatbot">Chatbot</Link></li>
        <li><Link href="/reception">Reception</Link></li>
        <li><Link href="/about">About</Link></li>
      </ul>
    </nav>
  );
}
