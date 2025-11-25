import Navbar from "./Navbar";
import { useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";

export default function NFTPage(props) {

    const [data, updateData] = useState({});
    const [dataFetched, updateDataFetched] = useState(false);
    const [message, updateMessage] = useState("");
    const [currAddress, updateCurrAddress] = useState("0x");
    const [isLoading, setIsLoading] = useState(false);

    async function getNFTData(tokenId) {
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const addr = await signer.getAddress();
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
        var tokenURI = await contract.tokenURI(tokenId);
        const listedToken = await contract.getListedTokenForId(tokenId);
        tokenURI = GetIpfsUrlFromPinata(tokenURI);
        let meta = await axios.get(tokenURI);
        meta = meta.data;

        let item = {
            price: meta.price,
            tokenId: tokenId,
            seller: listedToken.seller,
            owner: listedToken.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
        }
        updateData(item);
        updateDataFetched(true);
        updateCurrAddress(addr);
    }

    async function buyNFT(tokenId) {
        try {
            const ethers = require("ethers");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
            const salePrice = ethers.utils.parseUnits(data.price, 'ether')
            setIsLoading(true);
            updateMessage("Processing transaction... Please wait (up to 5 mins)")
            let transaction = await contract.executeSale(tokenId, { value: salePrice });
            await transaction.wait();

            alert('🎉 You successfully bought the NFT!');
            updateMessage("");
            setIsLoading(false);
        }
        catch (e) {
            alert("Transaction Error: " + e)
            setIsLoading(false);
            updateMessage("");
        }
    }

    const params = useParams();
    const tokenId = params.tokenId;
    if (!dataFetched)
        getNFTData(tokenId);
    if (typeof data.image == "string")
        data.image = GetIpfsUrlFromPinata(data.image);

    const isOwner = currAddress.toLowerCase() === data.owner?.toLowerCase();
    const isSeller = currAddress.toLowerCase() === data.seller?.toLowerCase();

    return (
        <div className="min-h-screen">
            <Navbar></Navbar>
            
            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-gray-400">
                <span className="hover:text-white cursor-pointer">Marketplace</span>
                <span className="mx-2">/</span>
                <span className="text-nft-purple font-semibold">{data.name}</span>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Image Section */}
                    <div className="flex items-center justify-center">
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-purple rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative bg-nft-darker rounded-2xl overflow-hidden">
                                <img 
                                    src={data.image} 
                                    alt={data.name} 
                                    className="w-full h-auto rounded-2xl object-cover" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col justify-between">
                        {/* Title and Basic Info */}
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">{data.name}</h1>
                            <p className="text-gray-400 mb-6">{data.description}</p>

                            {/* Token ID */}
                            <div className="mb-6 p-4 bg-nft-darker rounded-lg border border-nft-purple border-opacity-20">
                                <p className="text-sm text-gray-400 mb-1">Token ID</p>
                                <p className="font-mono text-white font-semibold">#{data.tokenId}</p>
                            </div>

                            {/* Price Section */}
                            <div className="mb-8">
                                <p className="text-sm text-gray-400 mb-2">Current Price</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-5xl font-bold gradient-text">{data.price}</span>
                                    <span className="text-2xl text-gray-400">ETH</span>
                                </div>
                            </div>

                            {/* Owner and Seller */}
                            <div className="space-y-4 mb-8">
                                {/* Owner */}
                                <div className="p-4 bg-nft-darker rounded-lg border border-nft-purple border-opacity-20">
                                    <p className="text-sm text-gray-400 mb-2">Owner</p>
                                    <p className="font-mono text-white break-all">{data.owner}</p>
                                    {isOwner && <span className="inline-block mt-2 text-xs bg-nft-success bg-opacity-20 text-nft-success px-2 py-1 rounded font-semibold">You own this NFT</span>}
                                </div>

                                {/* Seller */}
                                {data.seller !== data.owner && (
                                    <div className="p-4 bg-nft-darker rounded-lg border border-nft-purple border-opacity-20">
                                        <p className="text-sm text-gray-400 mb-2">Seller</p>
                                        <p className="font-mono text-white break-all">{data.seller}</p>
                                        {isSeller && <span className="inline-block mt-2 text-xs bg-nft-accent bg-opacity-20 text-nft-accent px-2 py-1 rounded font-semibold">You are the seller</span>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            {!isOwner && !isSeller ? (
                                <>
                                    <button 
                                        onClick={() => buyNFT(tokenId)}
                                        disabled={isLoading}
                                        className="w-full bg-gradient-purple hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 text-lg shadow-lg hover:shadow-glow flex items-center justify-center space-x-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>🛒</span>
                                                <span>Buy NFT</span>
                                            </>
                                        )}
                                    </button>
                                    {message && (
                                        <div className="p-4 bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg text-blue-400 text-center text-sm">
                                            {message}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="p-6 bg-gradient-to-r from-nft-success/10 to-nft-purple/10 border border-nft-success/30 rounded-lg text-center">
                                    <div className="text-2xl mb-2">✨</div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        {isOwner ? "You own this NFT" : "You are the seller"}
                                    </h3>
                                    <p className="text-gray-400 text-sm">This item is not available for purchase</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Info Section */}
                <div className="mt-16 pt-8 border-t border-nft-purple border-opacity-20">
                    <h2 className="text-2xl font-bold text-white mb-6">Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-nft-darker rounded-lg border border-nft-purple border-opacity-20">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Contract Address</p>
                            <p className="font-mono text-xs text-gray-300 break-all">{MarketplaceJSON.address}</p>
                        </div>
                        <div className="p-4 bg-nft-darker rounded-lg border border-nft-purple border-opacity-20">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Token Type</p>
                            <p className="text-white font-semibold">ERC-721</p>
                        </div>
                        <div className="p-4 bg-nft-darker rounded-lg border border-nft-purple border-opacity-20">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Network</p>
                            <p className="text-white font-semibold">Ethereum</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}