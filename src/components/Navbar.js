import fullLogo from "../full_logo.png";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

const usedChainId = "0x7a69"; // localhost

function Navbar() {
  const [connected, toggleConnect] = useState(false);
  const location = useLocation();
  const [currAddress, updateAddress] = useState("0x");

  async function getAddress() {
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    updateAddress(addr);
  }

  function updateButton() {
    const ethereumButton = document.querySelector(".enableEthereumButton");
    ethereumButton.textContent = "Connected";
    ethereumButton.classList.remove("hover:bg-blue-70");
    ethereumButton.classList.remove("bg-blue-500");
    ethereumButton.classList.add("hover:bg-green-70");
    ethereumButton.classList.add("bg-green-500");
    toggleConnect(true);
  }

  async function connectWebsite() {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId !== usedChainId) {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: usedChainId }],
      });
    }
    await window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then(() => {
        updateButton();
        getAddress();
        toggleConnect(true);
        window.location.replace(location.pathname);
      });
  }
  async function disConnetWebsite() {
    updateAddress("0x");
    const ethereumButton = document.querySelector(".enableEthereumButton");
    if (ethereumButton) {
      ethereumButton.textContent = "Connect Wallet";
      ethereumButton.classList.remove("hover:bg-green-70");
      ethereumButton.classList.remove("bg-green-500");
      ethereumButton.classList.add("hover:bg-blue-70");
      ethereumButton.classList.add("bg-blue-500");
    }

    // Try to call provider disconnect if available (WalletConnect or some providers)
    try {
      if (window.ethereum && typeof window.ethereum.disconnect === "function") {
        await window.ethereum.disconnect();
      } else if (
        window.ethereum &&
        window.ethereum._provider &&
        typeof window.ethereum._provider.disconnect === "function"
      ) {
        await window.ethereum._provider.disconnect();
      }
    } catch (err) {
      // Not all wallets support programmatic disconnect (MetaMask does not).
      // It's fine — we already cleared the app state. Log for debugging.
      console.warn("Wallet provider disconnect not available or failed:", err);
    }

    // Finalize app state
    toggleConnect(false);

    // Note: MetaMask currently doesn't provide a programmatic `disconnect` API.
    // The best we can do in a browser dapp is clear local state and ask the
    // user to disconnect via the wallet UI if they want to fully revoke access.
    console.info(
      "Disconnected in-app. If your wallet still shows a connection, please disconnect via your wallet (e.g. MetaMask) UI to revoke permissions."
    );
  }

  useEffect(() => {
    if (!window.ethereum) return;
    let val = window.ethereum.isConnected();
    if (val) {
      getAddress();
      toggleConnect(val);
      updateButton();
    }

    window.ethereum.on("accountsChanged", function (accounts) {
      // If no accounts, treat as disconnected
      if (!accounts || accounts.length === 0) {
        disConnetWebsite();
        return;
      }
      // Otherwise update address and UI
      updateAddress(accounts[0]);
      toggleConnect(true);
      updateButton();
      // refresh route so other components reload data for new account
      window.location.replace(location.pathname);
    });
  }, [location.pathname]);

  return (
    <div className="">
      <nav className="w-screen">
        <ul className="flex items-end justify-between py-3 bg-transparent text-white pr-5">
          <li className="flex items-end ml-5 pb-2">
            <Link to="/">
              <img
                src={fullLogo}
                alt=""
                width={120}
                height={120}
                className="inline-block -mt-2"
              />
              <div className="inline-block font-bold text-xl ml-2">
                NFT Marketplace
              </div>
            </Link>
          </li>
          <li className="w-2/6">
            <ul className="lg:flex justify-between font-bold mr-10 text-lg">
              {location.pathname === "/" ? (
                <li className="border-b-2 hover:pb-0 p-2">
                  <Link to="/">Marketplace</Link>
                </li>
              ) : (
                <li className="hover:border-b-2 hover:pb-0 p-2">
                  <Link to="/">Marketplace</Link>
                </li>
              )}
              {location.pathname === "/sellNFT" ? (
                <li className="border-b-2 hover:pb-0 p-2">
                  <Link to="/sellNFT">List My NFT</Link>
                </li>
              ) : (
                <li className="hover:border-b-2 hover:pb-0 p-2">
                  <Link to="/sellNFT">List My NFT</Link>
                </li>
              )}
              {location.pathname === "/profile" ? (
                <li className="border-b-2 hover:pb-0 p-2">
                  <Link to="/profile">Profile</Link>
                </li>
              ) : (
                <li className="hover:border-b-2 hover:pb-0 p-2">
                  <Link to="/profile">Profile</Link>
                </li>
              )}
              <li>              
                {
                  connected ? (
                    <button
                      className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
                      onClick={disConnetWebsite}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      className="ml-4 enableEthereumButton bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
                      onClick={connectWebsite}
                    >
                      Connect
                    </button>
                  )
                }
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      <div className="text-white text-bold text-right mr-10 text-sm">
        {currAddress !== "0x"
          ? "Connected to"
          : "Not Connected. Please login to view NFTs"}{" "}
        {currAddress !== "0x" ? currAddress.slice(0, 6) + "..." + currAddress.slice(-4) : ""}
      </div>
    </div>
  );
}

export default Navbar;
