// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "krw.sol";

/**
 * @title TapLinkPayment V2 - Multi-Shop
 * @dev Multi-shop payment contract for NFC tap-to-pay POC
 * @author TapLink Team
 */
contract TapLinkPaymentV2MultiShop {
    TestKRW public immutable krwToken;
    
    // Multi-shop support
    mapping(address => bool) public shopOwners;
    uint256 public shopOwnerCount;
    
    // Simple pause mechanism
    bool public paused;
    
    struct Product {
        string name;
        uint256 price;
        uint256 stock;
        bool active;
        address shopOwner;  // Track which shop owns this product
    }
    
    struct Payment {
        address buyer;
        string productId;
        uint256 amount;
        uint256 timestamp;
        string nfcId;
        bool refunded;
        address shopOwner;  // Track which shop received payment
    }
    
    mapping(string => Product) public products;
    mapping(uint256 => Payment) public payments;
    mapping(string => bool) public usedNfcIds;  // Prevent NFC replay
    uint256 public paymentCounter;
    
    // Events remain the same with added shop owner info
    event ShopOwnerAdded(address indexed shopOwner);
    event ShopOwnerRemoved(address indexed shopOwner);
    event ProductAdded(string indexed productId, string name, uint256 price, address indexed shopOwner);
    event ProductDeactivated(string indexed productId);
    event PaymentProcessed(
        uint256 indexed paymentId,
        address indexed buyer,
        string indexed productId,
        uint256 amount,
        string nfcId,
        address shopOwner
    );
    event PaymentRefunded(uint256 indexed paymentId, address indexed buyer, uint256 amount);
    event StockUpdated(string indexed productId, uint256 newStock);
    event EmergencyPause(bool isPaused);
    
    modifier onlyShopOwner() {
        require(shopOwners[msg.sender], "Only shop owner");
        _;
    }
    
    modifier onlyProductOwner(string memory productId) {
        require(products[productId].shopOwner == msg.sender, "Not product owner");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    constructor(address _krwToken) {
        krwToken = TestKRW(_krwToken);
        shopOwners[msg.sender] = true;
        shopOwnerCount = 1;
        emit ShopOwnerAdded(msg.sender);
    }
    
    /**
     * @dev Add a new shop owner (only existing shop owners can add)
     */
    function addShopOwner(address newOwner) external onlyShopOwner {
        require(newOwner != address(0), "Invalid address");
        require(!shopOwners[newOwner], "Already a shop owner");
        
        shopOwners[newOwner] = true;
        shopOwnerCount++;
        emit ShopOwnerAdded(newOwner);
    }
    
    /**
     * @dev Remove a shop owner (cannot remove if only one left)
     */
    function removeShopOwner(address owner) external onlyShopOwner {
        require(shopOwnerCount > 1, "Cannot remove last owner");
        require(shopOwners[owner], "Not a shop owner");
        
        shopOwners[owner] = false;
        shopOwnerCount--;
        emit ShopOwnerRemoved(owner);
    }
    
    /**
     * @dev Emergency pause toggle (any shop owner can pause)
     */
    function togglePause() external onlyShopOwner {
        paused = !paused;
        emit EmergencyPause(paused);
    }
    
    /**
     * @dev Add or update a product with validation
     * Each shop owner can only add their own products
     */
    function addProduct(
        string memory productId,
        string memory name,
        uint256 price,
        uint256 stock
    ) external onlyShopOwner {
        // Simple validation
        require(bytes(productId).length > 0, "Invalid product ID");
        require(bytes(name).length > 0, "Invalid product name");
        require(price > 0, "Price must be greater than 0");
        
        // Check if product exists and belongs to another shop
        if (products[productId].shopOwner != address(0) && 
            products[productId].shopOwner != msg.sender) {
            revert("Product ID owned by another shop");
        }
        
        products[productId] = Product({
            name: name,
            price: price,
            stock: stock,
            active: true,
            shopOwner: msg.sender
        });
        
        emit ProductAdded(productId, name, price, msg.sender);
    }
    
    /**
     * @dev Process NFC tap payment - SECURED VERSION
     * Payment goes to the shop owner of the product
     */
    function tapToPay(
        string memory productId,
        string memory nfcId
    ) external whenNotPaused {
        // Input validation
        require(bytes(productId).length > 0, "Invalid product ID");
        require(bytes(nfcId).length > 0, "Invalid NFC ID");
        
        // Prevent NFC replay attack
        require(!usedNfcIds[nfcId], "NFC already used");
        
        Product storage product = products[productId];
        require(product.active, "Product not active");
        require(product.stock > 0, "Out of stock");
        
        uint256 amount = product.price;
        address productShopOwner = product.shopOwner;
        require(krwToken.balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // UPDATE STATE FIRST (prevent reentrancy)
        usedNfcIds[nfcId] = true;
        product.stock--;
        
        uint256 currentPaymentId = paymentCounter;
        payments[currentPaymentId] = Payment({
            buyer: msg.sender,
            productId: productId,
            amount: amount,
            timestamp: block.timestamp,
            nfcId: nfcId,
            refunded: false,
            shopOwner: productShopOwner
        });
        paymentCounter++;
        
        // EXTERNAL CALL LAST - payment goes to product's shop owner
        require(
            krwToken.transferFrom(msg.sender, productShopOwner, amount),
            "Payment failed"
        );
        
        emit PaymentProcessed(currentPaymentId, msg.sender, productId, amount, nfcId, productShopOwner);
        emit StockUpdated(productId, product.stock);
    }
    
    /**
     * @dev Simple refund mechanism
     * Only the shop owner who received the payment can refund
     */
    function refundPayment(uint256 paymentId) external onlyShopOwner {
        Payment storage payment = payments[paymentId];
        require(payment.buyer != address(0), "Payment not found");
        require(!payment.refunded, "Already refunded");
        require(payment.shopOwner == msg.sender, "Not payment recipient");
        
        payment.refunded = true;
        
        // Refund from shop owner to buyer
        require(
            krwToken.transferFrom(msg.sender, payment.buyer, payment.amount),
            "Refund failed"
        );
        
        // Return stock
        products[payment.productId].stock++;
        
        emit PaymentRefunded(paymentId, payment.buyer, payment.amount);
        emit StockUpdated(payment.productId, products[payment.productId].stock);
    }
    
    /**
     * @dev Get product info for NFC scan
     */
    function getProduct(string memory productId) 
        external 
        view 
        returns (
            string memory name,
            uint256 price,
            uint256 stock,
            bool active,
            address shopOwner
        ) 
    {
        Product memory product = products[productId];
        return (product.name, product.price, product.stock, product.active, product.shopOwner);
    }
    
    /**
     * @dev Update product stock (only product owner)
     */
    function updateStock(string memory productId, uint256 newStock) 
        external 
        onlyShopOwner
        onlyProductOwner(productId)
    {
        require(bytes(productId).length > 0, "Invalid product ID");
        require(products[productId].active, "Product not found");
        products[productId].stock = newStock;
        emit StockUpdated(productId, newStock);
    }
    
    /**
     * @dev Deactivate a product (only product owner)
     */
    function deactivateProduct(string memory productId) 
        external 
        onlyShopOwner
        onlyProductOwner(productId)
    {
        require(products[productId].active, "Product already inactive");
        products[productId].active = false;
        emit ProductDeactivated(productId);
    }
    
    /**
     * @dev Get payment history for a specific shop owner
     */
    function getShopPayments(address shopOwner) 
        external 
        view 
        returns (
            uint256[] memory paymentIds,
            address[] memory buyers,
            string[] memory productIds,
            uint256[] memory amounts,
            uint256[] memory timestamps
        ) 
    {
        // Count payments for this shop
        uint256 count = 0;
        for (uint256 i = 0; i < paymentCounter; i++) {
            if (payments[i].shopOwner == shopOwner) {
                count++;
            }
        }
        
        // Limit to last 10
        if (count > 10) count = 10;
        
        paymentIds = new uint256[](count);
        buyers = new address[](count);
        productIds = new string[](count);
        amounts = new uint256[](count);
        timestamps = new uint256[](count);
        
        uint256 index = 0;
        for (uint256 i = paymentCounter; i > 0 && index < count; i--) {
            uint256 paymentId = i - 1;
            Payment memory payment = payments[paymentId];
            
            if (payment.shopOwner == shopOwner) {
                paymentIds[index] = paymentId;
                buyers[index] = payment.buyer;
                productIds[index] = payment.productId;
                amounts[index] = payment.amount;
                timestamps[index] = payment.timestamp;
                index++;
            }
        }
    }
    
    /**
     * @dev Get all recent payments (last 10 payments across all shops)
     */
    function getRecentPayments() 
        external 
        view 
        returns (
            uint256[] memory paymentIds,
            address[] memory buyers,
            string[] memory productIds,
            uint256[] memory amounts,
            uint256[] memory timestamps,
            address[] memory shopOwnerAddresses
        ) 
    {
        uint256 count = paymentCounter > 10 ? 10 : paymentCounter;
        
        paymentIds = new uint256[](count);
        buyers = new address[](count);
        productIds = new string[](count);
        amounts = new uint256[](count);
        timestamps = new uint256[](count);
        shopOwnerAddresses = new address[](count);
        
        for (uint256 i = 0; i < count; i++) {
            uint256 paymentId = paymentCounter - 1 - i;
            Payment memory payment = payments[paymentId];
            
            paymentIds[i] = paymentId;
            buyers[i] = payment.buyer;
            productIds[i] = payment.productId;
            amounts[i] = payment.amount;
            timestamps[i] = payment.timestamp;
            shopOwnerAddresses[i] = payment.shopOwner;
        }
    }
}