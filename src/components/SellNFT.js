import Navbar from "./Navbar";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from '../Marketplace.json';

export default function SellNFT () {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: ''});
    const [fileURL, setFileURL] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const ethers = require("ethers");
    const [message, updateMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function disableButton() {
        const listButton = document.getElementById("list-button")
        if (listButton) {
            listButton.disabled = true
        }
        setIsLoading(true);
    }

    async function enableButton() {
        const listButton = document.getElementById("list-button")
        if (listButton) {
            listButton.disabled = false
        }
        setIsLoading(false);
    }

    //This function uploads the NFT image to IPFS
    async function OnChangeFile(e) {
        var file = e.target.files[0];
        
        // Validate file
        if (!file) return;
        if (file.size > 500 * 1024) {
            setMessageType('error');
            updateMessage("File size exceeds 500KB limit");
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);

        try {
            disableButton();
            setMessageType('info');
            updateMessage("Uploading image to IPFS... please wait")
            const response = await uploadFileToIPFS(file);
            if(response.success === true) {
                enableButton();
                setMessageType('success');
                updateMessage("Image uploaded successfully!")
                console.log("Uploaded image to Pinata: ", response.pinataURL)
                setFileURL(response.pinataURL);
                setTimeout(() => updateMessage(''), 3000);
            }
        }
        catch(e) {
            enableButton();
            setMessageType('error');
            updateMessage("Error uploading image. Please try again.");
            console.log("Error during file upload", e);
        }
    }

    //This function uploads the metadata to IPFS
    async function uploadMetadataToIPFS() {
        const {name, description, price} = formParams;
        //Make sure that none of the fields are empty
        if( !name || !description || !price || !fileURL)
        {
            setMessageType('error');
            updateMessage("Please fill all the fields and upload an image!")
            return -1;
        }

        const nftJSON = {
            name, description, price, image: fileURL
        }

        try {
            //upload the metadata JSON to IPFS
            const response = await uploadJSONToIPFS(nftJSON);
            if(response.success === true){
                console.log("Uploaded JSON to Pinata: ", response)
                return response.pinataURL;
            }
        }
        catch(e) {
            setMessageType('error');
            updateMessage("Error uploading metadata. Please try again.");
            console.log("error uploading JSON metadata:", e)
        }
    }

    async function listNFT(e) {
        e.preventDefault();

        //Upload data to IPFS
        try {
            const metadataURL = await uploadMetadataToIPFS();
            if(metadataURL === -1) return;
            
            //After adding your Hardhat network to your metamask, this code will get providers and signers
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            disableButton();
            setMessageType('info');
            updateMessage("Creating NFT... this may take up to 5 minutes. Please don't close this page!")

            //Pull the deployed contract instance
            let contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer)

            //massage the params to be sent to the create NFT request
            const price = ethers.utils.parseUnits(formParams.price, 'ether')
            let listingPrice = await contract.getListPrice()
            listingPrice = listingPrice.toString()

            //actually create the NFT
            let transaction = await contract.createToken(metadataURL, price, { value: listingPrice })
            await transaction.wait()

            alert("🎉 Successfully listed your NFT!");
            enableButton();
            setMessageType('');
            updateMessage("");
            updateFormParams({ name: '', description: '', price: ''});
            setFileURL(null);
            setFilePreview(null);
            window.location.replace("/")
        }
        catch(e) {
            enableButton();
            setMessageType('error');
            updateMessage("Error creating NFT: " + e.message);
            console.error("Error:", e);
        }
    }

    const isFormValid = formParams.name && formParams.description && formParams.price && fileURL;

    return (
        <div className="min-h-screen">
            <Navbar></Navbar>
            
            {/* Hero Section */}
            <div className="relative bg-gradient-to-b from-nft-purple to-nft-purple/0 py-12 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-nft-purple rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
                </div>
                
                <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">List Your NFT</h1>
                    <p className="text-gray-400 text-lg">Create and list your unique digital asset on our marketplace</p>
                </div>
            </div>

            {/* Form Section */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <form className="bg-gradient-to-b from-nft-darker to-nft-dark border border-nft-purple border-opacity-20 rounded-2xl p-8 shadow-2xl" id="nftForm">
                    
                    {/* Message Display */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 animate-slide-in ${
                            messageType === 'error' ? 'bg-red-500 bg-opacity-10 border-red-500 text-red-400' :
                            messageType === 'success' ? 'bg-nft-success bg-opacity-10 border-nft-success text-nft-success' :
                            'bg-blue-500 bg-opacity-10 border-blue-500 text-blue-400'
                        }`}>
                            {messageType === 'error' && <span>❌</span>}
                            {messageType === 'success' && <span>✅</span>}
                            {messageType === 'info' && <span>ℹ️</span>}
                            <span>{message}</span>
                        </div>
                    )}

                    {/* NFT Name */}
                    <div className="mb-6">
                        <label className="block text-nft-purple font-semibold mb-3" htmlFor="name">
                            NFT Name *
                        </label>
                        <input 
                            className="w-full px-4 py-3 bg-nft-dark border border-nft-purple border-opacity-30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-nft-purple focus:shadow-glow transition-all" 
                            id="name" 
                            type="text" 
                            placeholder="e.g., Digital Art #001" 
                            onChange={e => updateFormParams({...formParams, name: e.target.value})} 
                            value={formParams.name}
                        />
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-nft-purple font-semibold mb-3" htmlFor="description">
                            Description *
                        </label>
                        <textarea 
                            className="w-full px-4 py-3 bg-nft-dark border border-nft-purple border-opacity-30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-nft-purple focus:shadow-glow transition-all resize-none" 
                            rows="5" 
                            id="description" 
                            placeholder="Describe your NFT, its features, and collection..." 
                            value={formParams.description} 
                            onChange={e => updateFormParams({...formParams, description: e.target.value})}
                        />
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                        <label className="block text-nft-purple font-semibold mb-3" htmlFor="price">
                            Price (in ETH) *
                        </label>
                        <div className="relative">
                            <input 
                                className="w-full px-4 py-3 bg-nft-dark border border-nft-purple border-opacity-30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-nft-purple focus:shadow-glow transition-all" 
                                type="number" 
                                placeholder="0.1" 
                                step="0.01"
                                min="0.01"
                                value={formParams.price} 
                                onChange={e => updateFormParams({...formParams, price: e.target.value})}
                            />
                            <span className="absolute right-4 top-3 text-gray-400 font-semibold">ETH</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Minimum 0.01 ETH</p>
                    </div>

                    {/* Image Upload */}
                    <div className="mb-8">
                        <label className="block text-nft-purple font-semibold mb-3" htmlFor="image">
                            Upload Image *
                        </label>
                        
                        {/* File Input Area */}
                        <div className="relative">
                            <input 
                                type="file" 
                                id="image"
                                onChange={OnChangeFile}
                                className="hidden"
                                accept="image/*"
                            />
                            <label htmlFor="image" className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-nft-purple border-opacity-30 rounded-lg cursor-pointer hover:border-opacity-60 hover:bg-nft-purple hover:bg-opacity-5 transition-all">
                                <div className="text-center">
                                    <svg className="w-12 h-12 mx-auto mb-2 text-nft-purple opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <p className="text-white font-semibold">Click to upload or drag and drop</p>
                                    <p className="text-gray-400 text-sm">PNG, JPG, GIF up to 500KB</p>
                                </div>
                            </label>
                        </div>

                        {/* Image Preview */}
                        {filePreview && (
                            <div className="mt-4 relative">
                                <img src={filePreview} alt="Preview" className="w-full max-h-64 object-cover rounded-lg border border-nft-purple border-opacity-30" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFilePreview(null);
                                        setFileURL(null);
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button 
                        onClick={listNFT} 
                        type="submit"
                        disabled={!isFormValid || isLoading}
                        className={`w-full font-bold py-4 px-6 rounded-lg text-white text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                            isFormValid && !isLoading
                                ? 'bg-gradient-purple hover:shadow-glow-lg cursor-pointer'
                                : 'bg-gray-600 opacity-50 cursor-not-allowed'
                        }`}
                        id="list-button"
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
                                <span>🚀</span>
                                <span>List NFT</span>
                            </>
                        )}
                    </button>

                    {/* Form Help Text */}
                    <div className="mt-6 p-4 bg-nft-purple bg-opacity-10 border border-nft-purple border-opacity-20 rounded-lg">
                        <p className="text-sm text-gray-400">
                            <span className="font-semibold text-nft-purple">ℹ️ Note:</span> Your NFT will be listed on the marketplace after the transaction is confirmed. This process may take up to 5 minutes.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}