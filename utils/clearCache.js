/**
 * Clear Cache Utility
 * 
 * This script clears all cached data for the app to help resolve loading issues.
 * Run this script when experiencing loading or connection problems.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.blue}⚙️  Starting cache cleanup process...${colors.reset}`);

try {
  // Clear Metro bundler cache
  console.log(`${colors.cyan}🧹 Clearing Metro bundler cache...${colors.reset}`);
  execSync('npx react-native start --reset-cache --no-interactive', { stdio: 'inherit' });

  // Clear Expo's cache - if available
  try {
    console.log(`${colors.cyan}🧹 Clearing Expo cache...${colors.reset}`);
    execSync('npx expo-cli start --clear', { stdio: 'inherit' });
  } catch (error) {
    console.log(`${colors.yellow}⚠️ Expo CLI cache clear failed, this is normal if using react-native CLI${colors.reset}`);
  }

  // Kill any running Metro processes
  console.log(`${colors.cyan}🔪 Killing any running Metro processes...${colors.reset}`);
  try {
    execSync('npx kill-port 8081 19000 19001 19002', { stdio: 'inherit' });
  } catch (error) {
    console.log(`${colors.yellow}⚠️ No Metro processes found to kill${colors.reset}`);
  }

  console.log(`${colors.green}✅ Cache cleanup completed successfully!${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}Next steps:${colors.reset}`);
  console.log(`${colors.cyan}1. Run 'npx expo start -c' to start with a clean cache${colors.reset}`);
  console.log(`${colors.cyan}2. Make sure your device and computer are on the same network${colors.reset}`);
  console.log(`${colors.cyan}3. Use the connection test button in the app to verify connectivity${colors.reset}`);

} catch (error) {
  console.error(`${colors.red}❌ Error during cache cleanup:${colors.reset}`, error);
  process.exit(1);
} 