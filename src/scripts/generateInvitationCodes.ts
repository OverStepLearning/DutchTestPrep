import mongoose from 'mongoose';
import InvitationCode from '../models/InvitationCode';
import config from '../config/environment';

// Generate a random invitation code
const generateCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate unique invitation codes
const generateUniqueCodes = async (count: number): Promise<string[]> => {
  const codes: string[] = [];
  const attempts = count * 2; // Allow for some duplicates
  
  for (let i = 0; i < attempts && codes.length < count; i++) {
    const code = generateCode();
    
    // Check if code already exists in our array or database
    if (!codes.includes(code)) {
      const existingCode = await InvitationCode.findOne({ code });
      if (!existingCode) {
        codes.push(code);
      }
    }
  }
  
  if (codes.length < count) {
    throw new Error(`Could only generate ${codes.length} unique codes out of ${count} requested`);
  }
  
  return codes.slice(0, count);
};

const generateInvitationCodes = async (count: number = 300) => {
  try {
    // Connect to database
    console.log('Connecting to database...');
    await mongoose.connect(config.databaseUrl);
    console.log('Connected to database');

    // Check existing codes
    const existingCount = await InvitationCode.countDocuments();
    console.log(`Found ${existingCount} existing invitation codes`);

    // Generate unique codes
    console.log(`Generating ${count} unique invitation codes...`);
    const codes = await generateUniqueCodes(count);
    console.log(`Generated ${codes.length} unique codes`);

    // Prepare codes for insertion
    const codeDocuments = codes.map(code => ({
      code,
      isUsed: false,
      createdAt: new Date()
    }));

    // Insert codes into database
    console.log('Inserting codes into database...');
    const result = await InvitationCode.insertMany(codeDocuments);
    console.log(`✅ Successfully inserted ${result.length} invitation codes`);

    // Display some sample codes
    console.log('\nSample invitation codes:');
    codes.slice(0, 10).forEach((code, index) => {
      console.log(`${index + 1}. ${code}`);
    });
    
    if (codes.length > 10) {
      console.log(`... and ${codes.length - 10} more codes`);
    }

    // Final count
    const totalCount = await InvitationCode.countDocuments();
    console.log(`\nTotal invitation codes in database: ${totalCount}`);
    
  } catch (error) {
    console.error('❌ Error generating invitation codes:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
    process.exit(0);
  }
};

// Run the script
if (require.main === module) {
  const count = parseInt(process.argv[2]) || 300;
  console.log(`Starting invitation code generation for ${count} codes...`);
  generateInvitationCodes(count);
}

export default generateInvitationCodes; 