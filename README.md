# NFTMarket

测试网URL: https://bafybeia3f3wo2dhxwk6fsg7pwl4x4bhcgtskxjk7vipsuvbdxk4idrjata.ipfs.dweb.link/#/

## 业务介绍

### 角色

- NFT 买家
- NFT 卖家
- NFT 市场管理员

### 场景

- NFT 买家可以查看 NFT，并购买 NFT
- NFT 卖家可以查看自己的 NFT，并售卖 NFT
- NFT 市场管理员可以修改策展价

#### 项目配置

1. 依赖安装 `npm install`
2. 启动本地链 `npx hardhat node`
3. 部署合约（本地） 【这步骤生产环境中用管理员账号进行部署】

   `npx hardhat run ./scripts/deploy.js --network localhost`

   部署后控制台打印合约地址，初次部署是这个地址：
   0x5FbDB2315678afecb367f032d93F642f64180aa3

4. 启动前端

   `npm start`
