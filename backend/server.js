const express = require('express');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Load contract address from deployment.json or .env
function getContractAddress() {
    // Use absolute path relative to this file
    const deploymentPath = path.join(__dirname, 'deployment.json'); // __dirname is backend/
    if (fs.existsSync(deploymentPath)) {
        try {
            const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
            console.log('📄 Loaded contract address from deployment.json:', deployment.contractAddress);
            return deployment.contractAddress;
        } catch (error) {
            console.log('⚠️ Could not read deployment.json:', error.message);
        }
    }
    
    if (process.env.CONTRACT_ADDRESS) {
        console.log('📄 Loaded contract address from .env:', process.env.CONTRACT_ADDRESS);
        return process.env.CONTRACT_ADDRESS;
    }

    console.log('⚠️ No contract address found.');
    return null;
}


// Blockchain configuration
const BLOCKCHAIN_CONFIG = {
    RPC_URL: process.env.RPC_URL || 'http://localhost:8545',
    PRIVATE_KEY: process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    CONTRACT_ADDRESS: getContractAddress(),
};

console.log('🔧 Blockchain Config:');
console.log('   RPC URL:', BLOCKCHAIN_CONFIG.RPC_URL);
console.log('   Contract Address:', BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS || 'Not set');

// Initialize blockchain connection
let provider, wallet, contract;

async function initializeBlockchain() {
    try {
        provider = new ethers.JsonRpcProvider(BLOCKCHAIN_CONFIG.RPC_URL);
        wallet = new ethers.Wallet(BLOCKCHAIN_CONFIG.PRIVATE_KEY, provider);
        
        console.log('📍 Wallet address:', wallet.address);
        
        // Contract ABI - matches your deployed contract
        const contractABI = [
            "function registerIdentity(string userId, bytes32 merkleRoot, string metadataURI) external",
            "function verifyIdentity(string userId) external",
            "function allocateAid(string userId, uint256 amount, string category, string allocationId) external",
            "function getIdentity(string userId) external view returns (bytes32, address, uint256, bool, string, uint256)",
            "function getAidBalance(string userId) external view returns (uint256)",
            "event IdentityRegistered(string indexed userId, bytes32 merkleRoot, address owner)",
            "event AidAllocated(string indexed userId, uint256 amount, string category, address allocatedBy)"
        ];
        
        if (BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS) {
            contract = new ethers.Contract(BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS, contractABI, wallet);
            console.log('🔗 Contract connected:', BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS);
            
            // Test contract connection
            try {
                await contract.getAddress();
                console.log('✅ Contract connection verified');
            } catch (error) {
                console.log('❌ Contract connection failed:', error.message);
                contract = null;
            }
        } else {
            console.log('⚠️ No contract address found. Deploy contract first.');
        }
        
        console.log('✅ Blockchain connection initialized');
    } catch (error) {
        console.error('❌ Blockchain initialization failed:', error.message);
    }
}

// Utility functions
function generateDigitalId() {
    return 'SID-' + crypto.randomBytes(6).toString('hex').toUpperCase();
}

// In-memory storage
let users = new Map();
let ngoSessions = new Map();
let transactions = [];

// Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        blockchain: !!contract,
        timestamp: new Date().toISOString(),
        contractAddress: BLOCKCHAIN_CONFIG.CONTRACT_ADDRESS,
        walletAddress: wallet ? wallet.address : null,
        rpcUrl: BLOCKCHAIN_CONFIG.RPC_URL
    });
});

// Register new identity
app.post('/api/register', upload.fields([
    { name: 'biometricPhoto', maxCount: 1 },
    { name: 'documents', maxCount: 10 }
]), async (req, res) => {
    try {
        const userData = JSON.parse(req.body.userData);
        const digitalId = generateDigitalId();
        
        console.log('📝 Registering new identity:', digitalId);
        console.log('👤 User data:', { 
            firstName: userData.firstName, 
            lastName: userData.lastName, 
            verificationMethod: userData.verificationMethod 
        });
        
        // Process uploaded files
        const documents = [];
        if (req.files && req.files.documents) {
            req.files.documents.forEach((file) => {
                documents.push({
                    name: file.originalname,
                    type: file.mimetype,
                    size: file.size,
                    hash: crypto.createHash('sha256').update(file.buffer).digest('hex')
                });
            });
            console.log('📎 Documents processed:', documents.length);
        }
        
        // Process biometric photo
        let biometricPhotoHash = null;
        if (req.files && req.files.biometricPhoto) {
            const photoBuffer = req.files.biometricPhoto[0].buffer;
            biometricPhotoHash = crypto.createHash('sha256').update(photoBuffer).digest('hex');
            userData.biometricPhoto = `data:image/jpeg;base64,${photoBuffer.toString('base64')}`;
            console.log('📸 Biometric photo processed');
        }
        
        // Create simple merkle root (in production, use proper merkle tree)
        const dataString = JSON.stringify({
            ...userData,
            documents: documents.map(d => d.hash),
            biometricPhotoHash
        });
        const merkleRoot = '0x' + crypto.createHash('sha256').update(dataString).digest('hex');
        
        // Store user data
        const userRecord = {
            digitalId,
            ...userData,
            documents,
            merkleRoot,
            biometricPhotoHash,
            registrationDate: new Date().toISOString(),
            isVerified: true, // Auto-verify for demo
            aidBalance: 0,
            reputationScore: 100,
            blockchainAddress: wallet ? wallet.address : null
        };
        
        users.set(digitalId, userRecord);
        console.log('💾 User stored in memory');
        
        // Register on blockchain if available
        let blockchainTxHash = null;
        if (contract) {
            try {
                console.log('🔗 Registering on blockchain...');
                const metadataURI = `ipfs://metadata/${digitalId}`;
                const tx = await contract.registerIdentity(digitalId, merkleRoot, metadataURI);
                console.log('⏳ Transaction sent:', tx.hash);
                
                // Wait for confirmation
                const receipt = await tx.wait();
                blockchainTxHash = tx.hash;
                userRecord.blockchainTxHash = blockchainTxHash;
                
                console.log('✅ Identity registered on blockchain:', tx.hash);
                console.log('📦 Block number:', receipt.blockNumber);
            } catch (error) {
                console.error('❌ Blockchain registration failed:', error.message);
                // Continue without blockchain registration for demo
            }
        } else {
            console.log('⚠️ No blockchain contract available - storing locally only');
        }
        
        res.json({
            success: true,
            digitalId,
            merkleRoot,
            blockchainTxHash,
            message: 'Identity registered successfully',
            blockchainEnabled: !!contract
        });
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

// NGO login
app.post('/api/ngo/login', (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('🏢 NGO login attempt:', email);
        
        // Demo NGO credentials
        const validNGOs = {
            'global.relief@ngo.org': { name: 'Global Relief Foundation', password: 'relief2024' },
            'food.aid@humanitarian.org': { name: 'World Food Aid', password: 'food2024' },
            'emergency.response@crisis.org': { name: 'Emergency Response Network', password: 'emergency2024' }
        };
        
        const ngo = validNGOs[email];
        if (!ngo || ngo.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        const sessionId = crypto.randomUUID();
        const ngoSession = {
            organizationName: ngo.name,
            email,
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };
        
        ngoSessions.set(sessionId, ngoSession);
        
        console.log('✅ NGO logged in:', ngo.name, 'Session ID:', sessionId);
        console.log('📋 Active NGO sessions:', ngoSessions.size);
        
        res.json({
            success: true,
            sessionId,
            organizationName: ngo.name,
            message: 'Login successful'
        });
        
    } catch (error) {
        console.error('❌ NGO login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// Get all beneficiaries
app.get('/api/ngo/beneficiaries', (req, res) => {
    try {
        const beneficiaries = Array.from(users.values()).map(user => ({
            digitalId: user.digitalId,
            firstName: user.firstName,
            lastName: user.lastName,
            location: user.location,
            isVerified: user.isVerified,
            aidBalance: user.aidBalance,
            reputationScore: user.reputationScore,
            registrationDate: user.registrationDate,
            blockchainTxHash: user.blockchainTxHash
        }));
        
        console.log('👥 Returning', beneficiaries.length, 'beneficiaries');
        
        res.json({
            success: true,
            beneficiaries
        });
        
    } catch (error) {
        console.error('❌ Get beneficiaries error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get beneficiaries',
            error: error.message
        });
    }
});

// Allocate aid
app.post('/api/ngo/allocate-aid', async (req, res) => {
    try {
        const { sessionId, beneficiaryId, amount, category } = req.body;
        
        console.log('💰 Aid allocation request:', { beneficiaryId, amount, category });
        console.log('🔑 Session ID provided:', sessionId);
        console.log('📋 Available sessions:', Array.from(ngoSessions.keys()));
        
        // Verify NGO session
        const ngoSession = ngoSessions.get(sessionId);
        if (!ngoSession) {
            console.log('❌ Session not found for ID:', sessionId);
            return res.status(401).json({
                success: false,
                message: 'Invalid session. Please login again.',
                debug: {
                    providedSessionId: sessionId,
                    availableSessions: Array.from(ngoSessions.keys())
                }
            });
        }
        
        console.log('✅ NGO session found:', ngoSession.organizationName);
        
        // Rest of your allocation code continues here...
        const user = users.get(beneficiaryId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Beneficiary not found'
            });
        }
        
        const allocationId = crypto.randomUUID();
        const transaction = {
            id: allocationId,
            type: 'Aid Allocation',
            beneficiaryId,
            amount: parseInt(amount),
            category,
            ngo: ngoSession.organizationName,
            timestamp: new Date().toISOString(),
            status: 'completed',
            blockchainTxHash: null
        };
        
        // Update user balance
        user.aidBalance += parseInt(amount);
        
        // Allocate aid on blockchain if available
        if (contract) {
            try {
                console.log('🔗 Allocating aid on blockchain...');
                const tx = await contract.allocateAid(
                    beneficiaryId,
                    ethers.parseEther(amount.toString()),
                    category,
                    allocationId
                );
                console.log('⏳ Transaction sent:', tx.hash);
                
                const receipt = await tx.wait();
                transaction.blockchainTxHash = tx.hash;
                console.log('✅ Aid allocated on blockchain:', tx.hash);
                console.log('📦 Block number:', receipt.blockNumber);
            } catch (error) {
                console.error('❌ Blockchain allocation failed:', error.message);
            }
        } else {
            console.log('⚠️ No blockchain contract - storing locally only');
        }
        
        transactions.push(transaction);
        
        res.json({
            success: true,
            transactionId: allocationId,
            blockchainTxHash: transaction.blockchainTxHash,
            message: 'Aid allocated successfully'
        });
        
    } catch (error) {
        console.error('❌ Aid allocation error:', error);
        res.status(500).json({
            success: false,
            message: 'Aid allocation failed',
            error: error.message
        });
    }
});

// Get transparency data
app.get('/api/transparency', (req, res) => {
    try {
        const totalBeneficiaries = users.size;
        const totalAid = transactions
            .filter(tx => tx.type === 'Aid Allocation')
            .reduce((sum, tx) => sum + tx.amount, 0);
        
        const categoryBreakdown = transactions
            .filter(tx => tx.type === 'Aid Allocation')
            .reduce((acc, tx) => {
                acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
                return acc;
            }, {});
        
        const recentTransactions = transactions
            .slice(-10)
            .map(tx => ({
                id: tx.id,
                type: tx.type,
                amount: tx.amount,
                timestamp: tx.timestamp,
                blockchainTxHash: tx.blockchainTxHash
            }));
        
        res.json({
            success: true,
            data: {
                totalBeneficiaries,
                totalAidDistributed: totalAid,
                categoryBreakdown,
                recentTransactions,
                blockchainEnabled: !!contract
            }
        });
        
    } catch (error) {
        console.error('❌ Get transparency data error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get transparency data',
            error: error.message
        });
    }
});

// Initialize blockchain and start server
initializeBlockchain().then(() => {
    app.listen(PORT, () => {
        console.log('🚀 Server running on port', PORT);
        console.log('🔗 Blockchain connected:', !!contract);
        console.log('📱 Frontend should connect to: http://localhost:' + PORT + '/api');
        console.log('\n🎯 Available endpoints:');
        console.log('  GET  /api/health');
        console.log('  POST /api/register');
        console.log('  POST /api/ngo/login');
        console.log('  POST /api/ngo/allocate-aid');
        console.log('  GET  /api/ngo/beneficiaries');
        console.log('  GET  /api/transparency');
        console.log('\n📊 Current status:');
        console.log('  Users registered:', users.size);
        console.log('  Transactions:', transactions.length);
    });
});

module.exports = app;