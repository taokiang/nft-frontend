import Navbar from "./Navbar";
import { useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import NFTTile from "./NFTTile";

export default function Profile () {
    const [data, updateData] = useState([]);
    const [dataFetched, updateFetched] = useState(false);
    const [address, updateAddress] = useState("0x");
    const [totalPrice, updateTotalPrice] = useState("0");

    async function getNFTData(tokenId) {
        const ethers = require("ethers");
        let sumPrice = 0;
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();

        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
        let transaction = await contract.getMyNFTs()

        const items = await Promise.all(transaction.map(async i => {
            const tokenURI = await contract.tokenURI(i.tokenId);
            let meta = await axios.get(tokenURI);
            meta = meta.data;

            let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
            let item = {
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.image,
                name: meta.name,
                description: meta.description,
            }
            sumPrice += Number(price);
            return item;
        }))

        updateData(items);
        updateFetched(true);
        updateAddress(addr);
        updateTotalPrice(sumPrice.toPrecision(3));
    }

    const params = useParams();
    const tokenId = params.tokenId;
    if(!dataFetched)
        getNFTData(tokenId);

    return (
        <div className="min-h-screen">
            <Navbar></Navbar>
            
            {/* Hero Section */}
            <div className="relative bg-gradient-to-b from-nft-purple to-nft-purple/0 py-12 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-nft-purple rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-nft-blue rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
                </div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Your Profile</h1>
                    <p className="text-gray-400 text-lg">Manage your NFT collection and portfolio</p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Wallet Info Card */}
                <div className="mb-12 p-6 bg-gradient-to-r from-nft-purple/20 to-nft-blue/20 border border-nft-purple border-opacity-30 rounded-2xl">
                    <h2 className="text-sm text-gray-400 uppercase tracking-widest mb-3">Wallet Address</h2>
                    <p className="font-mono text-2xl font-bold text-white break-all">{address}</p>
                    <button 
                        onClick={() => navigator.clipboard.writeText(address)}
                        className="mt-4 text-sm text-nft-purple hover:text-nft-purple-dark transition-colors"
                    >
                        📋 Copy Address
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* NFT Count Card */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-purple rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative bg-nft-darker rounded-2xl p-8 text-center border border-nft-purple border-opacity-20">
                            <div className="text-5xl font-bold gradient-text mb-2">{data.length}</div>
                            <p className="text-gray-400 text-lg">NFTs Owned</p>
                            <div className="mt-4 h-1 bg-gradient-purple rounded-full"></div>
                        </div>
                    </div>

                    {/* Total Value Card */}
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-purple rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative bg-nft-darker rounded-2xl p-8 text-center border border-nft-purple border-opacity-20">
                            <div className="text-5xl font-bold gradient-text mb-2">{totalPrice}</div>
                            <p className="text-gray-400 text-lg">Total Portfolio Value</p>
                            <p className="text-sm text-nft-purple mt-2">ETH</p>
                        </div>
                    </div>
                </div>

                {/* NFTs Section */}
                <div>
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Your NFTs</h2>
                        <p className="text-gray-400">
                            {data.length === 0 
                                ? "You don't own any NFTs yet" 
                                : `Showing ${data.length} item${data.length !== 1 ? 's' : ''}`
                            }
                        </p>
                    </div>

                    {data.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {data.map((value, index) => (
                                <div key={index} className="animate-slide-in" style={{animationDelay: `${index * 0.05}s`}}>
                                    <NFTTile data={value}></NFTTile>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🎨</div>
                            <h3 className="text-2xl font-semibold text-gray-400 mb-2">No NFTs Yet</h3>
                            <p className="text-gray-500 mb-8">Start building your collection by exploring the marketplace</p>
                            <a href="/#/" className="inline-block bg-nft-purple hover:bg-nft-purple-dark text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-glow">
                                Browse Marketplace
                            </a>
                        </div>
                    )}
                </div>

                {/* Empty State Alternative */}
                {data.length === 0 && !dataFetched && (
                    <div className="text-center py-12">
                        <svg className="animate-spin h-12 w-12 text-nft-purple mx-auto mb-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-400 mt-4">Loading your NFTs...</p>
                    </div>
                )}
            </div>
        </div>
    )
};