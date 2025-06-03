import mongoose from 'mongoose';
import User from '../models/User';
import UserProgress from '../models/UserProgress';
import config from '../config/environment';

const clearDatabase = async () => {
  try {
    // Connect to database
    console.log('Connecting to database...');
    await mongoose.connect(config.databaseUrl);
    console.log('Connected to database');

    // Get counts before deletion
    const userCount = await User.countDocuments();
    const progressCount = await UserProgress.countDocuments();
    
    console.log(`Found ${userCount} users and ${progressCount} user progress records`);

    // Confirm deletion in production
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  WARNING: You are about to delete ALL USERS from PRODUCTION database!');
      console.log('This action cannot be undone.');
      
      // In production, require explicit confirmation
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise<string>((resolve) => {
        rl.question('Type "DELETE ALL USERS" to confirm: ', resolve);
      });
      
      rl.close();

      if (answer !== 'DELETE ALL USERS') {
        console.log('Operation cancelled.');
        process.exit(0);
      }
    }

    // Delete all user progress first (to avoid foreign key issues)
    console.log('Deleting all user progress...');
    const progressResult = await UserProgress.deleteMany({});
    console.log(`Deleted ${progressResult.deletedCount} user progress records`);

    // Delete all users
    console.log('Deleting all users...');
    const userResult = await User.deleteMany({});
    console.log(`Deleted ${userResult.deletedCount} users`);

    console.log('✅ Database cleanup completed successfully');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
    process.exit(0);
  }
};

// Run the script
if (require.main === module) {
  clearDatabase();
}

export default clearDatabase; 