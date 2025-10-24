// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UniversalIdentityRegistry {
    struct Identity {
        bytes32 merkleRoot;
        address owner;
        uint256 timestamp;
        bool isVerified;
        string metadataURI;
        uint256 reputationScore;
    }
    
    struct AidAllocation {
        uint256 amount;
        string category;
        address allocatedBy;
        uint256 timestamp;
        bool claimed;
    }
    
    // Mappings
    mapping(string => Identity) public identities;
    mapping(string => mapping(string => AidAllocation)) public aidAllocations;
    mapping(string => uint256) public aidBalances;
    mapping(address => bool) public authorizedNGOs;
    mapping(string => string[]) public userAidHistory;
    
    // Events
    event IdentityRegistered(string indexed userId, bytes32 merkleRoot, address owner);
    event IdentityVerified(string indexed userId, address verifier);
    event AidAllocated(string indexed userId, uint256 amount, string category, address allocatedBy);
    event AidClaimed(string indexed userId, uint256 amount, string category);
    event NGOAuthorized(address indexed ngoAddress, bool authorized);
    event ReputationUpdated(string indexed userId, uint256 newScore);
    
    // Modifiers
    modifier onlyAuthorizedNGO() {
        require(authorizedNGOs[msg.sender], "Not authorized NGO");
        _;
    }
    
    modifier onlyIdentityOwner(string memory userId) {
        require(identities[userId].owner == msg.sender, "Not identity owner");
        _;
    }
    
    modifier identityExists(string memory userId) {
        require(identities[userId].timestamp > 0, "Identity does not exist");
        _;
    }
    
    constructor() {
        // Contract deployer is the first authorized NGO
        authorizedNGOs[msg.sender] = true;
    }
    
    // Register a new identity
    function registerIdentity(
        string memory userId,
        bytes32 merkleRoot,
        string memory metadataURI
    ) external {
        require(identities[userId].timestamp == 0, "Identity already exists");
        
        identities[userId] = Identity({
            merkleRoot: merkleRoot,
            owner: msg.sender,
            timestamp: block.timestamp,
            isVerified: false,
            metadataURI: metadataURI,
            reputationScore: 0
        });
        
        emit IdentityRegistered(userId, merkleRoot, msg.sender);
    }
    
    // Verify identity (only authorized NGOs)
    function verifyIdentity(string memory userId) 
        external 
        onlyAuthorizedNGO 
        identityExists(userId) 
    {
        identities[userId].isVerified = true;
        identities[userId].reputationScore = 100; // Initial reputation
        
        emit IdentityVerified(userId, msg.sender);
    }
    
    // Allocate aid to a beneficiary
    function allocateAid(
        string memory userId,
        uint256 amount,
        string memory category,
        string memory allocationId
    ) external onlyAuthorizedNGO identityExists(userId) {
        require(identities[userId].isVerified, "Identity not verified");
        
        aidAllocations[userId][allocationId] = AidAllocation({
            amount: amount,
            category: category,
            allocatedBy: msg.sender,
            timestamp: block.timestamp,
            claimed: false
        });
        
        aidBalances[userId] += amount;
        userAidHistory[userId].push(allocationId);
        
        emit AidAllocated(userId, amount, category, msg.sender);
    }
    
    // Claim aid (beneficiary)
    function claimAid(string memory userId, string memory allocationId) 
        external 
        onlyIdentityOwner(userId) 
        identityExists(userId) 
    {
        AidAllocation storage allocation = aidAllocations[userId][allocationId];
        require(!allocation.claimed, "Aid already claimed");
        require(allocation.amount > 0, "Invalid allocation");
        
        allocation.claimed = true;
        
        // Update reputation for claiming aid
        identities[userId].reputationScore += 5;
        
        emit AidClaimed(userId, allocation.amount, allocation.category);
    }
    
    // Authorize/deauthorize NGO (only current authorized NGOs)
    function authorizeNGO(address ngoAddress, bool authorized) 
        external 
        onlyAuthorizedNGO 
    {
        authorizedNGOs[ngoAddress] = authorized;
        emit NGOAuthorized(ngoAddress, authorized);
    }
    
    // Update reputation (for participation in programs)
    function updateReputation(string memory userId, uint256 points) 
        external 
        onlyAuthorizedNGO 
        identityExists(userId) 
    {
        identities[userId].reputationScore += points;
        emit ReputationUpdated(userId, identities[userId].reputationScore);
    }
    
    // Verify identity with proof (simplified ZKP verification)
    function verifyWithProof(
        string memory userId,
        bytes32 merkleRoot,
        bytes32[] memory proof,
        bytes32 leaf
    ) external view returns (bool) {
        if (identities[userId].merkleRoot != merkleRoot) {
            return false;
        }
        
        // Simplified merkle proof verification
        bytes32 computedHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }
        
        return computedHash == merkleRoot;
    }
    
    // Get identity details
    function getIdentity(string memory userId) 
        external 
        view 
        returns (
            bytes32 merkleRoot,
            address owner,
            uint256 timestamp,
            bool isVerified,
            string memory metadataURI,
            uint256 reputationScore
        ) 
    {
        Identity memory identity = identities[userId];
        return (
            identity.merkleRoot,
            identity.owner,
            identity.timestamp,
            identity.isVerified,
            identity.metadataURI,
            identity.reputationScore
        );
    }
    
    // Get aid balance
    function getAidBalance(string memory userId) 
        external 
        view 
        returns (uint256) 
    {
        return aidBalances[userId];
    }
    
    // Get aid history
    function getAidHistory(string memory userId) 
        external 
        view 
        returns (string[] memory) 
    {
        return userAidHistory[userId];
    }
}