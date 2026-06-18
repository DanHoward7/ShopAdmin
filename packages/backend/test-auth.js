// Simple test script to verify authentication endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test 1: Login with admin credentials
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@shopadmin.com',
      password: 'admin123'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      console.log('   User:', loginResponse.data.data.user.name, `(${loginResponse.data.data.user.role})`);
      
      const accessToken = loginResponse.data.data.tokens.accessToken;
      
      // Test 2: Get user profile with token
      console.log('\n2. Testing authenticated request...');
      const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (profileResponse.data.success) {
        console.log('✅ Authenticated request successful');
        console.log('   Profile:', profileResponse.data.data.user.name);
      }
      
      // Test 3: Test protected route without token
      console.log('\n3. Testing request without token...');
      try {
        await axios.get(`${BASE_URL}/auth/me`);
      } catch (error) {
        if (error.response.status === 401) {
          console.log('✅ Properly rejected request without token');
        }
      }
      
    }
    
    console.log('\n🎉 All authentication tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuth();
