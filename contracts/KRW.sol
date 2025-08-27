// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title TestKRW
 * @dev KRW Stablecoin Token for Kaia Testnet with Faucet functionality
 * @notice This is a test token for development purposes only
 */
contract TestKRW {
    // State variables
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    uint256 private _totalSupply;
    string public constant name = "KRW Stable Coin";
    string public constant symbol = "KRW";
    uint8 public constant decimals = 18; // Using 18 decimals for better precision
    
    address public immutable owner;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    event FaucetClaimed(address indexed claimer, uint256 amount, uint256 timestamp);
    event FaucetParametersUpdated(uint256 newAmount, uint256 newCooldown);
    
    // Faucet configuration
    mapping(address => uint256) public lastFaucetClaim;
    uint256 public faucetAmount = 10000 * 10**18; // 10,000 KRW default
    uint256 public faucetCooldown = 1 hours; // 1 hour for testnet (can be adjusted)
    uint256 public constant MAX_FAUCET_AMOUNT = 100000 * 10**18; // 100,000 KRW max
    
    // Daily limits for security
    mapping(address => uint256) public dailyMintCount;
    mapping(address => uint256) public lastMintDay;
    uint256 public constant MAX_DAILY_MINTS = 5;
    uint256 public constant MAX_MINT_AMOUNT = 1000000 * 10**18; // 1M KRW per mint
    
    // Total supply cap for testnet
    uint256 public constant MAX_TOTAL_SUPPLY = 1000000000 * 10**18; // 1 billion KRW cap
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid zero address");
        _;
    }
    
    modifier faucetEligible() {
        require(
            block.timestamp >= lastFaucetClaim[msg.sender] + faucetCooldown,
            "Faucet cooldown not met"
        );
        _;
    }
    
    /**
     * @dev Constructor initializes the token with initial supply to deployer
     */
    constructor() {
        owner = msg.sender;
        // Mint initial supply to deployer (10M KRW)
        _mint(msg.sender, 10000000 * 10**decimals);
    }
    
    // ERC20 Standard Functions
    
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) public view validAddress(account) returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address recipient, uint256 amount) 
        public 
        validAddress(recipient) 
        returns (bool) 
    {
        _transfer(msg.sender, recipient, amount);
        return true;
    }
    
    function allowance(address tokenOwner, address spender) 
        public 
        view 
        returns (uint256) 
    {
        return _allowances[tokenOwner][spender];
    }
    
    function approve(address spender, uint256 amount) 
        public 
        validAddress(spender) 
        returns (bool) 
    {
        _approve(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address sender, address recipient, uint256 amount) 
        public 
        validAddress(sender) 
        validAddress(recipient) 
        returns (bool) 
    {
        uint256 currentAllowance = _allowances[sender][msg.sender];
        require(currentAllowance >= amount, "Transfer amount exceeds allowance");
        
        _transfer(sender, recipient, amount);
        
        // Update allowance with overflow check
        unchecked {
            _approve(sender, msg.sender, currentAllowance - amount);
        }
        
        return true;
    }
    
    // Enhanced ERC20 Functions
    
    /**
     * @dev Increase allowance
     */
    function increaseAllowance(address spender, uint256 addedValue) 
        public 
        validAddress(spender) 
        returns (bool) 
    {
        _approve(msg.sender, spender, _allowances[msg.sender][spender] + addedValue);
        return true;
    }
    
    /**
     * @dev Decrease allowance
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) 
        public 
        validAddress(spender) 
        returns (bool) 
    {
        uint256 currentAllowance = _allowances[msg.sender][spender];
        require(currentAllowance >= subtractedValue, "Decreased allowance below zero");
        unchecked {
            _approve(msg.sender, spender, currentAllowance - subtractedValue);
        }
        return true;
    }
    
    // Faucet Functions
    
    /**
     * @dev Faucet function - claim free test KRW with cooldown
     */
    function faucet() public faucetEligible {
        require(_totalSupply + faucetAmount <= MAX_TOTAL_SUPPLY, "Would exceed max supply");
        
        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, faucetAmount);
        
        emit FaucetClaimed(msg.sender, faucetAmount, block.timestamp);
    }
    
    /**
     * @dev Check time until next faucet claim
     */
    function timeUntilNextClaim(address user) public view returns (uint256) {
        if (lastFaucetClaim[user] == 0) return 0;
        
        uint256 timePassed = block.timestamp - lastFaucetClaim[user];
        if (timePassed >= faucetCooldown) return 0;
        
        return faucetCooldown - timePassed;
    }
    
    /**
     * @dev Check if address can claim from faucet
     */
    function canClaimFaucet(address user) public view returns (bool) {
        return block.timestamp >= lastFaucetClaim[user] + faucetCooldown;
    }
    
    // Mint Functions (for testing)
    
    /**
     * @dev Public mint with daily limits for testnet
     */
    function mint(address to, uint256 amount) public validAddress(to) {
        require(amount <= MAX_MINT_AMOUNT, "Exceeds max mint amount");
        require(_totalSupply + amount <= MAX_TOTAL_SUPPLY, "Would exceed max supply");
        
        // Check daily limit
        uint256 currentDay = block.timestamp / 1 days;
        if (lastMintDay[msg.sender] < currentDay) {
            dailyMintCount[msg.sender] = 0;
            lastMintDay[msg.sender] = currentDay;
        }
        
        require(dailyMintCount[msg.sender] < MAX_DAILY_MINTS, "Daily mint limit reached");
        dailyMintCount[msg.sender]++;
        
        _mint(to, amount);
    }
    
    /**
     * @dev Owner mint without restrictions
     */
    function ownerMint(address to, uint256 amount) public onlyOwner validAddress(to) {
        require(_totalSupply + amount <= MAX_TOTAL_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
    }
    
    // Burn Function
    
    /**
     * @dev Burn tokens from caller's balance
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Burn tokens from specific address (requires allowance)
     */
    function burnFrom(address account, uint256 amount) public validAddress(account) {
        uint256 currentAllowance = _allowances[account][msg.sender];
        require(currentAllowance >= amount, "Burn amount exceeds allowance");
        
        unchecked {
            _approve(account, msg.sender, currentAllowance - amount);
        }
        _burn(account, amount);
    }
    
    // Admin Functions
    
    /**
     * @dev Update faucet parameters (owner only)
     */
    function updateFaucetParameters(uint256 _faucetAmount, uint256 _faucetCooldown) 
        public 
        onlyOwner 
    {
        require(_faucetAmount <= MAX_FAUCET_AMOUNT, "Exceeds max faucet amount");
        require(_faucetCooldown >= 1 minutes, "Cooldown too short");
        
        faucetAmount = _faucetAmount;
        faucetCooldown = _faucetCooldown;
        
        emit FaucetParametersUpdated(_faucetAmount, _faucetCooldown);
    }
    
    // Internal Functions
    
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "Transfer from zero address");
        require(recipient != address(0), "Transfer to zero address");
        
        uint256 senderBalance = _balances[sender];
        require(senderBalance >= amount, "Transfer amount exceeds balance");
        
        unchecked {
            _balances[sender] = senderBalance - amount;
        }
        _balances[recipient] += amount;
        
        emit Transfer(sender, recipient, amount);
    }
    
    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "Mint to zero address");
        
        _totalSupply += amount;
        _balances[account] += amount;
        
        emit Transfer(address(0), account, amount);
        emit Mint(account, amount);
    }
    
    function _burn(address account, uint256 amount) internal {
        require(account != address(0), "Burn from zero address");
        
        uint256 accountBalance = _balances[account];
        require(accountBalance >= amount, "Burn amount exceeds balance");
        
        unchecked {
            _balances[account] = accountBalance - amount;
        }
        _totalSupply -= amount;
        
        emit Transfer(account, address(0), amount);
        emit Burn(account, amount);
    }
    
    function _approve(address tokenOwner, address spender, uint256 amount) internal {
        require(tokenOwner != address(0), "Approve from zero address");
        require(spender != address(0), "Approve to zero address");
        
        _allowances[tokenOwner][spender] = amount;
        emit Approval(tokenOwner, spender, amount);
    }
    
    // View Functions for Better UX
    
    /**
     * @dev Get comprehensive faucet info for a user
     */
    function getFaucetInfo(address user) 
        public 
        view 
        returns (
            bool canClaim,
            uint256 timeUntilNext,
            uint256 claimAmount,
            uint256 lastClaimTime
        ) 
    {
        canClaim = canClaimFaucet(user);
        timeUntilNext = timeUntilNextClaim(user);
        claimAmount = faucetAmount;
        lastClaimTime = lastFaucetClaim[user];
    }
    
    /**
     * @dev Get user's daily mint info
     */
    function getMintInfo(address user) 
        public 
        view 
        returns (
            uint256 mintsToday,
            uint256 mintsRemaining,
            bool canMintMore
        ) 
    {
        uint256 currentDay = block.timestamp / 1 days;
        if (lastMintDay[user] < currentDay) {
            mintsToday = 0;
        } else {
            mintsToday = dailyMintCount[user];
        }
        mintsRemaining = MAX_DAILY_MINTS - mintsToday;
        canMintMore = mintsToday < MAX_DAILY_MINTS;
    }
}