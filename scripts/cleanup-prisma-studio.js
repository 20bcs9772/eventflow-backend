const { exec } = require('child_process');

const PORT = 5556;

console.log(`🧹 Cleaning up Prisma Studio processes on port ${PORT}...`);

if (process.platform === 'win32') {
  exec(`netstat -ano | findstr :${PORT}`, (error, stdout) => {
    if (error || !stdout) {
      console.log('✅ No processes found on port', PORT);
      return;
    }

    const pids = new Set();
    const lines = stdout.split('\n');
    lines.forEach(line => {
      const match = line.match(/\s+(\d+)\s*$/);
      if (match && match[1] && match[1] !== '0') {
        pids.add(match[1]);
      }
    });

    if (pids.size === 0) {
      console.log('✅ No processes found on port', PORT);
      return;
    }

    const pidArray = Array.from(pids);
    const killCommand = `taskkill /F ${pidArray.map(pid => `/PID ${pid}`).join(' ')}`;
    
    exec(killCommand, (killError) => {
      if (killError) {
        console.error('❌ Error killing processes:', killError.message);
      } else {
        console.log(`✅ Successfully killed ${pids.size} process(es) on port ${PORT}`);
      }
    });
  });
} else {
  console.log('⚠️  This script is designed for Windows. On Linux/Mac, use:');
  console.log(`   lsof -ti:${PORT} | xargs kill -9`);
}

