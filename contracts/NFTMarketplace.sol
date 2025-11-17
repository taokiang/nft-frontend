// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

// 导入OpenZeppelin的计数器工具库
import "@openzeppelin/contracts/utils/Counters.sol";
// 导入OpenZeppelin的合约所有权控制
import "@openzeppelin/contracts/access/Ownable.sol";
// 导入ERC721带URI存储扩展
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// 导入Hardhat的console日志（仅开发调试用）
import "hardhat/console.sol";

// NFTMarketplace合约，继承Ownable和ERC721URIStorage
contract NFTMarketplace is Ownable, ERC721URIStorage {

    using Counters for Counters.Counter; // 使用计数器库

    // 上架NFT时需支付的手续费，默认为0.01 ETH
    uint256 listPrice = 0.01 ether;
    // NFT的tokenId计数器
    Counters.Counter private _tokenIds;
    // 已售出NFT数量计数器
    Counters.Counter private _itemsSold;

    // tokenId到上架信息的映射
    mapping(uint256 => ListedToken) private idToListedToken;

    // 上架NFT的结构体
    struct ListedToken {
        uint256 tokenId;                // NFT的tokenId
        address payable owner;          // 当前拥有者
        address payable seller;         // 卖家
        uint256 price;                  // 售价
        bool curentlyListed;            // 是否当前上架
    }

    // NFT上架成功事件
    event TokenListedSuccess(
        uint256 indexed tokenId,
        address owner,
        address seller,
        uint256 price,
        bool currentlyListed
    );

    // 构造函数，初始化ERC721合约名和简称
    constructor() Ownable() ERC721("NFTMarketplace", "NFTM") {
        // 构造函数体可留空
    }

    // ================= 合约拥有者相关 =================

    /// @notice 更新上架手续费，仅合约拥有者可调用
    /// @param _listPrice 新的手续费（单位：wei）
    function updateListPrice(uint256 _listPrice) external onlyOwner {
        listPrice = _listPrice;
    }

    // ================= 卖家相关 =================

    /// @notice 创建NFT并上架市场
    /// @param tokenURI NFT的元数据URI
    /// @param price NFT的售价
    /// @return 新铸造的tokenId
    function createToken(string memory tokenURI, uint256 price) payable external returns (uint256) {
        // 要求价格大于0
        require(price > 0, "price must greater than zero");
        // 要求支付的手续费等于listPrice
        require(msg.value == listPrice, "need send enough list price");
        // 铸造NFT
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        // 创建上架信息，owner为市场合约地址，seller为当前用户
        idToListedToken[newTokenId] = ListedToken(newTokenId, payable(address(this)), payable(msg.sender), price, true);
        // 将NFT转移到市场合约
        _transfer(msg.sender, address(this), newTokenId);
        // 触发上架事件
        emit TokenListedSuccess(newTokenId, address(this), msg.sender, price, true);
        return _tokenIds.current();
    }

    // ================= 买家相关 =================

    /// @notice 购买NFT
    /// @param tokenId 购买的NFT的tokenId
    function executeSale(uint256 tokenId) payable external {
        // 获取上架信息
        ListedToken storage token = idToListedToken[tokenId];
        // 要求NFT已上架
        require(token.curentlyListed, "nft must listed");
        // 要求支付的金额等于NFT价格
        require(msg.value == token.price, "price not enough");

        address payable seller = token.seller;
        // 更新卖家为买家
        token.seller = payable(msg.sender);

        // NFT转移给买家
        _transfer(address(this), msg.sender, tokenId);

        // 将NFT价格转账给卖家
        seller.transfer(token.price);
        // 将手续费转账给合约拥有者
        payable(owner()).transfer(listPrice);

        // 已售出数量+1
        _itemsSold.increment();
    }

    // ================= 查询与扩展 =================

    /// @notice 获取所有NFT的上架信息
    function getAllNFTs() external view returns (ListedToken[] memory) {
        uint totalTokens = _tokenIds.current();
        ListedToken[] memory _listedTokens = new ListedToken[](totalTokens);
        for (uint i = 0; i < totalTokens; i++) {
            _listedTokens[i] = idToListedToken[i + 1];
        }
        return _listedTokens;
    }

    /// @notice 获取当前用户相关的NFT（拥有或卖出过的）
    function getMyNFTs() external view returns (ListedToken[] memory) {
        uint totalTokens = _tokenIds.current();
        uint myTokensCount = 0;
        // 先统计属于自己的NFT数量
        for (uint i = 0; i < totalTokens; i++) {
            if (idToListedToken[i + 1].owner == msg.sender || idToListedToken[i + 1].seller == msg.sender) {
                myTokensCount += 1;
            }
        }
        ListedToken[] memory _listedTokens = new ListedToken[](myTokensCount);
        uint256 currentIndex = 0;
        // 再收集属于自己的NFT
        for (uint i = 0; i < totalTokens; i++) {
            if (idToListedToken[i + 1].owner == msg.sender || idToListedToken[i + 1].seller == msg.sender) {
                _listedTokens[currentIndex] = idToListedToken[i + 1];
                currentIndex += 1;
            }
        }
        return _listedTokens;
    }

    /// @notice 获取最新的tokenId
    function getLatestIdToListedToken() external view returns (uint256) {
        return _tokenIds.current();
    }

    /// @notice 根据tokenId获取上架信息
    function getListedTokenForId(uint256 _tokenId) external view returns (ListedToken memory) {
        return idToListedToken[_tokenId];
    }

    /// @notice 获取当前最新的NFT上架信息
    function getCurrentToken() external view returns (ListedToken memory) {
        return idToListedToken[_tokenIds.current()];
    }

    /// @notice 获取当前上架手续费
    function getListPrice() external view returns (uint256) {
        return listPrice;
    }

    /// @notice 接收ETH的回退函数
    receive() external payable {
        console.log("fallback");
        // fallback函数，接收ETH
    }

}