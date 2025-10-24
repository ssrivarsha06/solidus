// scripts/setup.js - Run this to set up everything automatically
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 SOLIDUS AID FLOW - Automated Setup Starting...\n');

async function runCommand(command, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    console.log(`📍 Running: ${command} in ${cwd}`);
    const process = exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error}`);
        reject(error);
        return;
      }
      console.log(`✅ ${command} completed`);
      resolve(stdout);
    });
    
    process.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    process.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}

function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created: ${filePath}`);
}

function copyEnvExample() {
  const envExamplePath = path.join(process.cwd(), '.env.example');
  const envPath = path.join(process.cwd(), '.env');
  
  const envContent = `# Blockchain Configuration
RPC_URL=http://localhost:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CONTRACT_ADDRESS=

# Optional: Testnet URLs
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY

# Backend Configuration
PORT=5000
MONGODB_URI=mongodb://localhost:27017/solidus_aid
JWT_SECRET=your_super_secret_key_here_change_this_in_production
`;
  
  createFile(envPath, envContent);
}

function createFrontendEnv() {
  const frontendEnvPath = path.join(process.cwd(), 'frontend', '.env');
  const envContent = `REACT_APP_API_URL=http://localhost:5000/api
`;
  createFile(frontendEnvPath, envContent);
}

async function main() {
  try {
    // Step 1: Create environment files
    console.log('\n📝 Step 1: Setting up environment files...');
    copyEnvExample();
    createFrontendEnv();
    
    // Step 2: Install root dependencies
    console.log('\n📦 Step 2: Installing root dependencies...');
    await runCommand('npm install');
    
    // Step 3: Install backend dependencies
    console.log('\n🔧 Step 3: Installing backend dependencies...');
    await runCommand('npm install', path.join(process.cwd(), 'backend'));
    
    // Step 4: Install frontend dependencies
    console.log('\n⚛️ Step 4: Installing frontend dependencies...');
    await runCommand('npm install', path.join(process.cwd(), 'frontend'));
    
    // Step 5: Compile smart contracts
    console.log('\n🔨 Step 5: Compiling smart contracts...');
    await runCommand('npx hardhat compile');
    
    console.log('\n🎉 SETUP COMPLETED SUCCESSFULLY! 🎉\n');
    console.log('📋 NEXT STEPS:');
    console.log('1️⃣  Start blockchain:     npm run node');
    console.log('2️⃣  Deploy contracts:    npm run deploy-local');  
    console.log('3️⃣  Start backend:       npm run dev-backend');
    console.log('4️⃣  Start frontend:      npm run dev-frontend');
    console.log('\n💡 Or run everything at once: npm run dev');
    console.log('\n🌐 Your app will be available at:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend:  http://localhost:5000/api');
    console.log('   Blockchain: http://localhost:8545');
    console.log('\n🔐 NGO Login Credentials:');
    console.log('   Email:    global.relief@ngo.org');
    console.log('   Password: relief2024');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n🛠️  Manual setup required. Please follow the step-by-step guide.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };