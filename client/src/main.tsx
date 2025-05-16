import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// Import Solana wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

createRoot(document.getElementById("root")!).render(<App />);
