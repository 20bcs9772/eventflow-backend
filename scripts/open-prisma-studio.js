const { spawn } = require('child_process');
const { exec } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  console.warn('⚠️  Warning: .env file not found. Trying to load from environment...');
  require('dotenv').config();
}

// Function to check if port is available
function checkPort(port, callback) {
  const server = http.createServer();
  server.listen(port, () => {
    server.once('close', () => callback(true));
    server.close();
  });
  server.on('error', () => callback(false));
}

// Try to find an available port
function findAvailablePort(startPort, callback) {
  checkPort(startPort, (available) => {
    if (available) {
      callback(startPort);
    } else {
      console.warn(`⚠️  Port ${startPort} is already in use. Trying alternative port...`);
      findAvailablePort(startPort + 1, callback);
    }
  });
}

const START_PORT = 5555;
let PORT = START_PORT;
let URL = `http://localhost:${PORT}`;

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('\n❌ Error: DATABASE_URL is not set!');
  console.error('📝 Please create a .env file in the project root with:');
  console.error('   DATABASE_URL="postgresql://user:password@localhost:5432/eventflow?schema=public"');
  console.error('\n💡 See SETUP_GUIDE.md for more details.\n');
  process.exit(1);
}

// Find available port and start Prisma Studio
findAvailablePort(START_PORT, (availablePort) => {
  PORT = availablePort;
  URL = `http://localhost:${PORT}`;
  
  if (PORT !== START_PORT) {
    console.log(`ℹ️  Using port ${PORT} instead of ${START_PORT}\n`);
  }
  
  console.log('🚀 Starting Prisma Studio...');
  console.log(`📊 Studio will be available at: ${URL}`);
  console.log('⏳ Please wait for it to start...\n');

  // Start Prisma Studio
  const studio = spawn('npx', ['prisma', 'studio', '--port', PORT.toString()], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  });

  startStudio(studio, URL);
});

function startStudio(studio, studioUrl) {
  let browserOpened = false;

  // Function to check if Prisma Studio is ready
  function checkIfReady(retries = 30) {
    const req = http.get(studioUrl, (res) => {
    if (res.statusCode === 200 || res.statusCode === 302) {
      if (!browserOpened) {
        browserOpened = true;
        console.log(`\n✅ Prisma Studio is ready!`);
        console.log(`🌐 Opening browser at ${studioUrl}...\n`);
        
        // Use platform-specific command to open browser
        const command = process.platform === 'win32' 
          ? `start "" "${studioUrl}"` 
          : process.platform === 'darwin'
          ? `open "${studioUrl}"`
          : `xdg-open "${studioUrl}"`;
        
        exec(command, (error) => {
          if (error) {
            console.log(`⚠️  Could not open browser automatically.`);
            console.log(`📋 Please manually open: ${studioUrl}`);
          }
        });
      }
    }
  });

  req.on('error', () => {
    // Server not ready yet
    if (retries > 0) {
      setTimeout(() => checkIfReady(retries - 1), 1000);
    } else {
      console.log(`\n⚠️  Prisma Studio did not start within 30 seconds.`);
      console.log(`📋 If it's running, please manually open: ${studioUrl}`);
      console.log(`💡 Check the console above for any error messages.`);
    }
  });

  req.setTimeout(1000, () => {
    req.destroy();
    if (retries > 0 && !browserOpened) {
      setTimeout(() => checkIfReady(retries - 1), 1000);
    }
  });
}

  // Start checking after a short delay
  setTimeout(() => checkIfReady(), 2000);

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down Prisma Studio...');
    studio.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    studio.kill();
    process.exit(0);
  });

  studio.on('error', (error) => {
    console.error('\n❌ Error starting Prisma Studio:', error);
    console.error('💡 Make sure Prisma is installed: npm install');
    process.exit(1);
  });

  studio.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) {
      console.error(`\n❌ Prisma Studio exited with code ${code}`);
      console.error('💡 Common issues:');
      console.error('   - DATABASE_URL is incorrect or database is not accessible');
      console.error('   - Database migrations not run (try: npm run prisma:migrate)');
      console.error('   - PostgreSQL server is not running');
      process.exit(1);
    }
  });
}

