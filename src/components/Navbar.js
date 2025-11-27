import fullLogo from "../logo.png";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

// const usedChainId = "0x7a69"; // localhost 31337
const usedChainId = "0xaa36a7"; // sepolia 11155111


function Navbar() {
  const [connected, toggleConnect] = useState(false);
  const location = useLocation();
  const [currAddress, updateAddress] = useState("0x");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function updateButton() {
    const ethereumButton = document.querySelector(".enableEthereumButton");
    if (ethereumButton) {
      ethereumButton.textContent = "Connected";
      ethereumButton.classList.remove("bg-blue-500", "hover:bg-blue-700");
      ethereumButton.classList.add("bg-nft-success", "hover:bg-green-600");
    }
    toggleConnect(true);
  }

  async function connectWebsite() {
    if (connected) return;
    
    try {
      // First, ensure we're on the correct chain
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== usedChainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: usedChainId }],
          });
        } catch (switchError) {
          // Chain doesn't exist, user needs to add it manually
          console.error("Cannot switch to chain, may need to add it manually:", switchError);
        }
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        updateAddress(accounts[0]);
        updateButton();
        toggleConnect(true);
        window.location.replace(location.pathname);
      }
    } catch (error) {
      console.error("Connection error:", error);
      if (error.code === -32602) {
        alert("Invalid chain ID. Please add Sepolia network to MetaMask manually.");
      } else if (error.code !== -32603) {
        // -32603 is user rejection, no need to alert
        alert("Failed to connect wallet. Please try again.");
      }
    }
  }

  async function disConnetWebsite() {
    updateAddress("0x");
    const ethereumButton = document.querySelector(".enableEthereumButton");
    if (ethereumButton) {
      ethereumButton.textContent = "Connect Wallet";
      ethereumButton.classList.remove("bg-nft-success", "hover:bg-green-600");
      ethereumButton.classList.add("bg-nft-blue", "hover:bg-blue-700");
    }
    toggleConnect(false);
  }

  useEffect(() => {
    if (!window.ethereum) {
      console.warn("MetaMask not installed");
      return;
    }

    // Check if accounts are already authorized
    const checkAndGetAccounts = async () => {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts && accounts.length > 0) {
          updateAddress(accounts[0]);
          toggleConnect(true);
          updateButton();
        }
      } catch (error) {
        console.warn("Could not fetch accounts:", error.message);
      }
    };

    checkAndGetAccounts();

    // Listen for account changes
    const handleAccountsChanged = (accounts) => {
      if (!accounts || accounts.length === 0) {
        disConnetWebsite();
        return;
      }
      updateAddress(accounts[0]);
      toggleConnect(true);
      updateButton();
      window.location.replace(location.pathname);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="">
      <nav className="w-full bg-gradient-to-b from-nft-dark to-nft-darker border-b border-nft-purple border-opacity-20 backdrop-blur-md sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <img
                  src={fullLogo}
                  alt="NFT Marketplace Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10"
                />
                <div className="text-xl font-bold gradient-text hidden sm:block">
                  NFT Marketplace
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  isActive("/")
                    ? "bg-nft-purple text-white shadow-lg shadow-nft-purple/50"
                    : "text-gray-300 hover:text-white hover:bg-nft-purple hover:bg-opacity-10"
                }`}
              >
                Marketplace
              </Link>
              <Link
                to="/sellNFT"
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  isActive("/sellNFT")
                    ? "bg-nft-purple text-white shadow-lg shadow-nft-purple/50"
                    : "text-gray-300 hover:text-white hover:bg-nft-purple hover:bg-opacity-10"
                }`}
              >
                List NFT
              </Link>
              <Link
                to="/profile"
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                  isActive("/profile")
                    ? "bg-nft-purple text-white shadow-lg shadow-nft-purple/50"
                    : "text-gray-300 hover:text-white hover:bg-nft-purple hover:bg-opacity-10"
                }`}
              >
                Profile
              </Link>
            </div>

            {/* Wallet Button */}
            <button
              className="enableEthereumButton bg-nft-blue hover:bg-nft-blue-dark text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300 shadow-lg hover:shadow-glow hidden sm:inline-flex items-center space-x-2"
              onClick={connectWebsite}
            >
              {connected ? "✓ Connected" : "Connect Wallet"}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2 rounded-lg hover:bg-nft-purple hover:bg-opacity-10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <Link
                to="/"
                className={`block px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  isActive("/")
                    ? "bg-nft-purple text-white"
                    : "text-gray-300 hover:text-white hover:bg-nft-purple hover:bg-opacity-10"
                }`}
              >
                Marketplace
              </Link>
              <Link
                to="/sellNFT"
                className={`block px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  isActive("/sellNFT")
                    ? "bg-nft-purple text-white"
                    : "text-gray-300 hover:text-white hover:bg-nft-purple hover:bg-opacity-10"
                }`}
              >
                List NFT
              </Link>
              <Link
                to="/profile"
                className={`block px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  isActive("/profile")
                    ? "bg-nft-purple text-white"
                    : "text-gray-300 hover:text-white hover:bg-nft-purple hover:bg-opacity-10"
                }`}
              >
                Profile
              </Link>
              <button
                className="enableEthereumButton w-full bg-nft-blue hover:bg-nft-blue-dark text-white font-bold py-2 px-4 rounded-lg text-sm transition-all"
                onClick={connectWebsite}
              >
                {connected ? "✓ Connected" : "Connect Wallet"}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Account Info Bar */}
      {currAddress !== "0x" && (
        <div className="bg-nft-purple bg-opacity-10 border-b border-nft-purple border-opacity-20 px-4 py-2">
          <div className="max-w-7xl mx-auto text-sm text-gray-300">
            <span className="text-nft-purple font-semibold">Connected:</span> {currAddress.slice(0, 6)}...{currAddress.slice(-4)}
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
