import {
    Link,
} from "react-router-dom";
import { GetIpfsUrlFromPinata } from "../utils";
import { useState } from "react";

function NFTTile(data) {
    const [isHovered, setIsHovered] = useState(false);
    const newTo = {
        pathname: "/nftPage/" + data.data.tokenId
    }

    const IPFSUrl = GetIpfsUrlFromPinata(data.data.image);

    return (
        <Link to={newTo} className="h-full">
            <div 
                className="relative group h-full rounded-xl overflow-hidden card-hover"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Image Container */}
                <div className="relative h-72 overflow-hidden bg-nft-darker">
                    <img 
                        src={IPFSUrl} 
                        alt={data.data.name} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                        crossOrigin="anonymous" 
                    />
                    
                    {/* Overlay on Hover */}
                    {isHovered && (
                        <div className="absolute inset-0 bg-gradient-to-t from-nft-dark via-transparent to-transparent opacity-80"></div>
                    )}

                    {/* View Details Button */}
                    {isHovered && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button className="bg-nft-purple hover:bg-nft-purple-dark text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-nft-purple/50 transform hover:scale-105">
                                View Details
                            </button>
                        </div>
                    )}

                    {/* Price Badge */}
                    <div className="absolute top-4 right-4 bg-nft-purple bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-white shadow-lg">
                        {data.data.price} ETH
                    </div>
                </div>

                {/* Content Section */}
                <div className="bg-gradient-to-b from-nft-darker to-nft-darker p-4 border-t border-nft-purple border-opacity-20">
                    {/* Name */}
                    <h3 className="text-lg font-bold text-white mb-2 truncate group-hover:text-nft-purple transition-colors">
                        {data.data.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10">
                        {data.data.description}
                    </p>

                    {/* Action Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-nft-purple border-opacity-10">
                        <span className="text-xs text-gray-500">Token #{data.data.tokenId}</span>
                        <span className="text-xs bg-nft-purple bg-opacity-20 text-nft-purple px-2 py-1 rounded font-semibold">
                            View →
                        </span>
                    </div>
                </div>

                {/* Card Border Glow Effect */}
                <div className="absolute inset-0 border border-nft-purple rounded-xl opacity-0 group-hover:opacity-50 pointer-events-none transition-opacity duration-300"></div>
            </div>
        </Link>
    )
}

export default NFTTile;
