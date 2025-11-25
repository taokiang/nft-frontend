import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";

export default function Marketplace() {
  const sampleData = [];
  const [data, updateData] = useState(sampleData);
  const [dataFetched, updateFetched] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filteredData, setFilteredData] = useState([]);

  async function getAllNFTs() {
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      MarketplaceJSON.address,
      MarketplaceJSON.abi,
      signer
    );

    const transaction = await contract.getAllNFTs();

    const items = await Promise.all(
      transaction.map(async (i) => {
        var tokenURI = await contract.tokenURI(i.tokenId);
        tokenURI = GetIpfsUrlFromPinata(tokenURI);
        let meta = await axios.get(tokenURI);
        meta = meta.data;

        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.image,
          name: meta.name,
          description: meta.description,
        };
        return item;
      })
    );

    updateData(items);
    updateFetched(true);
    filterAndSort(items, searchTerm, sortBy);
  }

  const filterAndSort = (items, search, sort) => {
    let filtered = items.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
    );

    if (sort === "newest") {
      filtered.sort((a, b) => b.tokenId - a.tokenId);
    } else if (sort === "priceLow") {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sort === "priceHigh") {
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }

    setFilteredData(filtered);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    filterAndSort(data, value, sortBy);
  };

  const handleSort = (value) => {
    setSortBy(value);
    filterAndSort(data, searchTerm, value);
  };

  if (!dataFetched) getAllNFTs();

  const displayData = filteredData.length > 0 ? filteredData : data;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-nft-purple to-nft-purple/0 py-12 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-nft-purple rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-nft-blue rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">NFT Marketplace</h1>
          <p className="text-gray-400 text-lg mb-8">Discover, collect, and trade unique digital assets</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search NFTs by name or description..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-3 bg-nft-darker border border-nft-purple border-opacity-30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-nft-purple focus:shadow-glow transition-all"
            />
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="w-full px-4 py-3 bg-nft-darker border border-nft-purple border-opacity-30 rounded-lg text-white focus:outline-none focus:border-nft-purple focus:shadow-glow transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing <span className="text-nft-purple font-semibold">{displayData.length}</span> NFTs
          </p>
        </div>

        {/* NFT Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {displayData.length > 0 ? (
            displayData.map((value, index) => (
              <div key={index} className="animate-slide-in" style={{animationDelay: `${index * 0.05}s`}}>
                <NFTTile data={value} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <svg className="w-24 h-24 mx-auto text-gray-500 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No NFTs Found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or check back later</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
