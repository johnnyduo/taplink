// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "KRW.sol";

/**
 * @title TapLinkPayment V2
 * @dev Simple but secure payment contract for NFC tap-to-pay POC
 * @author TapLink Team
 */
contract TapLinkPaymentV2 {
    TestKRW public immutable krwToken;
    address public immutable shopOwner;
    
    // Simple pause mechanism
    bool public paused;
    
    struct Product {
        string name;
        uint256 price;
        uint256 stock;
        bool active;
    }
    
    struct Payment {
        address buyer;
        string productId;
        uint256 amount;
        uint256 timestamp;
        string nfcId;
        bool refunded;  // Added for refunds
    }
    
    mapping(string => Product) public products;
    mapping(uint256 => Payment) public payments;
    mapping(string => bool) public usedNfcIds;  // Prevent NFC replay
    uint256 public paymentCounter;
    
    // Added missing events
    event ProductAdded(string indexed productId, string name, uint256 price);
    event ProductDeactivated(string indexed productId);
    event PaymentProcessed(
        uint256 indexed paymentId,
        address indexed buyer,
        string indexed productId,
        uint256 amount,
        string nfcId
    );
    event PaymentRefunded(uint256 indexed paymentId, address indexed buyer, uint256 amount);
    event StockUpdated(string indexed productId, uint256 newStock);
    event EmergencyPause(bool isPaused);
    
    modifier onlyShopOwner() {
        require(msg.sender == shopOwner, "Only shop owner");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    constructor(address _krwToken) {
        krwToken = TestKRW(_krwToken);
        shopOwner = msg.sender;
    }
    
    /**
     * @dev Emergency pause toggle
     */
    function togglePause() external onlyShopOwner {
        paused = !paused;
        emit EmergencyPause(paused);
    }
    
    /**
     * @dev Add or update a product with validation
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
        
        products[productId] = Product({
            name: name,
            price: price,
            stock: stock,
            active: true
        });
        
        emit ProductAdded(productId, name, price);
    }
    
    /**
     * @dev Process NFC tap payment - SECURED VERSION
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
            refunded: false
        });
        paymentCounter++;
        
        // EXTERNAL CALL LAST
        require(
            krwToken.transferFrom(msg.sender, shopOwner, amount),
            "Payment failed"
        );
        
        emit PaymentProcessed(currentPaymentId, msg.sender, productId, amount, nfcId);
        emit StockUpdated(productId, product.stock);
    }
    
    /**
     * @dev Simple refund mechanism
     */
    function refundPayment(uint256 paymentId) external onlyShopOwner {
        Payment storage payment = payments[paymentId];
        require(payment.buyer != address(0), "Payment not found");
        require(!payment.refunded, "Already refunded");
        
        payment.refunded = true;
        
        // Refund from shop owner to buyer
        require(
            krwToken.transferFrom(shopOwner, payment.buyer, payment.amount),
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
            bool active
        ) 
    {
        Product memory product = products[productId];
        return (product.name, product.price, product.stock, product.active);
    }
    
    /**
     * @dev Update product stock
     */
    function updateStock(string memory productId, uint256 newStock) 
        external 
        onlyShopOwner 
    {
        require(bytes(productId).length > 0, "Invalid product ID");
        require(products[productId].active, "Product not found");
        products[productId].stock = newStock;
        emit StockUpdated(productId, newStock);
    }
    
    /**
     * @dev Deactivate a product
     */
    function deactivateProduct(string memory productId) 
        external 
        onlyShopOwner 
    {
        require(products[productId].active, "Product already inactive");
        products[productId].active = false;
        emit ProductDeactivated(productId);
    }
    
    /**
     * @dev Get payment history (last 10 payments)
     */
    function getRecentPayments() 
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
        uint256 count = paymentCounter > 10 ? 10 : paymentCounter;
        
        paymentIds = new uint256[](count);
        buyers = new address[](count);
        productIds = new string[](count);
        amounts = new uint256[](count);
        timestamps = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            uint256 paymentId = paymentCounter - 1 - i;
            Payment memory payment = payments[paymentId];
            
            paymentIds[i] = paymentId;
            buyers[i] = payment.buyer;
            productIds[i] = payment.productId;
            amounts[i] = payment.amount;
            timestamps[i] = payment.timestamp;
        }
    }
}