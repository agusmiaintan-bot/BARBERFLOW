// Test Script untuk Database dan Socket.IO
require('dotenv').config();
const mongoose = require('mongoose');

console.log('🧪 BARBERFLOW - Test Connection');
console.log('=' .repeat(50));

// Test 1: Environment Variables
console.log('\n📋 Environment Variables:');
console.log('PORT:', process.env.PORT || '3001');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Not Set');
console.log('EMAIL_PENGIRIM:', process.env.EMAIL_PENGIRIM ? '✅ Set' : '❌ Not Set');

// Test 2: Database Connection
async function testDatabase() {
    console.log('\n📡 Testing Database Connection...');
    
    if (!process.env.MONGO_URI) {
        console.error('❌ MONGO_URI not configured in .env file');
        return false;
    }
    
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        });
        
        console.log('✅ Database connected successfully!');
        console.log('📊 Database name:', mongoose.connection.db.databaseName);
        
        // Test query
        const Antrian = require('./model/antrian');
        const count = await Antrian.countDocuments();
        console.log(`📝 Total antrian in database: ${count}`);
        
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

// Test 3: Socket.IO Dependencies
function testSocketIO() {
    console.log('\n🔌 Testing Socket.IO...');
    try {
        const socketio = require('socket.io');
        console.log('✅ Socket.IO package installed');
        console.log('📦 Socket.IO version:', require('socket.io/package.json').version);
        return true;
    } catch (error) {
        console.error('❌ Socket.IO not installed:', error.message);
        return false;
    }
}

// Run all tests
async function runTests() {
    const socketIOResult = testSocketIO();
    const dbResult = await testDatabase();
    
    console.log('\n' + '=' .repeat(50));
    console.log('📊 Test Results:');
    console.log('Socket.IO:', socketIOResult ? '✅ OK' : '❌ FAIL');
    console.log('Database:', dbResult ? '✅ OK' : '❌ FAIL');
    console.log('=' .repeat(50));
    
    if (socketIOResult && dbResult) {
        console.log('\n🎉 All tests passed! System ready to run.');
    } else {
        console.log('\n⚠️ Some tests failed. Please fix the issues above.');
    }
    
    process.exit(socketIOResult && dbResult ? 0 : 1);
}

runTests().catch(console.error);
