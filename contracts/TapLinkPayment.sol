// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "KRW.sol";

/**
 * @title TapLinkPayment
 * @dev Simple payment contract for NFC tap-to-pay functionality
 * @author TapLink Team
 */
contract TapLinkPayment {
    TestKRW public immutable krwToken;
    address public immutable shopOwner;
    
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
    }
    
    mapping(string => Product) public products;
    mapping(uint256 => Payment) public payments;
    uint256 public paymentCounter;
    
    event ProductAdded(string indexed productId, string name, uint256 price);
    event PaymentProcessed(
        uint256 indexed paymentId,
        address indexed buyer,
        string indexed productId,
        uint256 amount,
        string nfcId
    );
    event StockUpdated(string indexed productId, uint256 newStock);
    
    modifier onlyShopOwner() {
        require(msg.sender == shopOwner, "Only shop owner");
        _;
    }
    
    constructor(address _krwToken) {
        krwToken = TestKRW(_krwToken);
        shopOwner = msg.sender;
    }
    
    /**
     * @dev Add or update a product
     */
    function addProduct(
        string memory productId,
        string memory name,
        uint256 price,
        uint256 stock
    ) external onlyShopOwner {
        products[productId] = Product({
            name: name,
            price: price,
            stock: stock,
            active: true
        });
        
        emit ProductAdded(productId, name, price);
    }
    
    /**
     * @dev Process NFC tap payment
     */
    function tapToPay(
        string memory productId,
        string memory nfcId
    ) external {
        Product storage product = products[productId];
        require(product.active, "Product not found or inactive");
        require(product.stock > 0, "Out of stock");
        
        uint256 amount = product.price;
        
        // Check buyer has enough balance
        require(krwToken.balanceOf(msg.sender) >= amount, "Insufficient KRW balance");
        
        // Transfer KRW from buyer to shop owner
        require(
            krwToken.transferFrom(msg.sender, shopOwner, amount),
            "Payment failed - check allowance"
        );
        
        // Update stock
        product.stock--;
        
        // Record payment
        payments[paymentCounter] = Payment({
            buyer: msg.sender,
            productId: productId,
            amount: amount,
            timestamp: block.timestamp,
            nfcId: nfcId
        });
        
        emit PaymentProcessed(
            paymentCounter,
            msg.sender,
            productId,
            amount,
            nfcId
        );
        
        emit StockUpdated(productId, product.stock);
        
        paymentCounter++;
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
