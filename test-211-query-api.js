/**
 * Test script to explore 211 API endpoints
 * Based on the Query V2 API documentation
 */

async function test211QueryAPI() {
  console.log('🧪 Testing 211 Query API endpoints...\n');

  const API_KEY = '4c04c16b41264059b8b696adfbf61abd';

  // Test 1: Try to find the Search API endpoint
  console.log('📍 Test 1: Attempting Search API v1...');
  try {
    const searchUrl = 'https://api.211.org/search/v1/records';
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': API_KEY,
      },
      body: JSON.stringify({
        terms: 'housing',
        location: { postalCode: '68901' },
        distance: 25,
        pageSize: 10,
      }),
    });

    console.log('  Status:', response.status, response.statusText);
    if (response.ok) {
      const data = await response.json();
      console.log('  ✅ Success! Data:', JSON.stringify(data, null, 2));
      return;
    } else {
      const errorText = await response.text();
      console.log('  ❌ Error:', errorText);
    }
  } catch (error) {
    console.log('  ❌ Exception:', error.message);
  }

  // Test 2: Try Search API without version
  console.log('\n📍 Test 2: Attempting Search API (no version)...');
  try {
    const searchUrl = 'https://api.211.org/search';
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': API_KEY,
      },
      body: JSON.stringify({
        terms: 'housing',
        location: { postalCode: '68901' },
        distance: 25,
      }),
    });

    console.log('  Status:', response.status, response.statusText);
    if (response.ok) {
      const data = await response.json();
      console.log('  ✅ Success! Data:', JSON.stringify(data, null, 2));
      return;
    } else {
      const errorText = await response.text();
      console.log('  ❌ Error:', errorText);
    }
  } catch (error) {
    console.log('  ❌ Exception:', error.message);
  }

  // Test 3: Try to list available APIs (OPTIONS request)
  console.log('\n📍 Test 3: Checking available endpoints (OPTIONS)...');
  try {
    const response = await fetch('https://api.211.org/', {
      method: 'OPTIONS',
      headers: {
        'Ocp-Apim-Subscription-Key': API_KEY,
      },
    });

    console.log('  Status:', response.status, response.statusText);
    console.log('  Headers:', Object.fromEntries(response.headers.entries()));
  } catch (error) {
    console.log('  ❌ Exception:', error.message);
  }

  // Test 4: Try Query API v2 endpoint structure
  console.log('\n📍 Test 4: Checking Query API v2 base path...');
  try {
    const response = await fetch('https://api.211.org/resources/v2/query', {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': API_KEY,
      },
    });

    console.log('  Status:', response.status, response.statusText);
    if (response.ok) {
      const data = await response.text();
      console.log('  Response:', data);
    } else {
      const errorText = await response.text();
      console.log('  Error:', errorText);
    }
  } catch (error) {
    console.log('  ❌ Exception:', error.message);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Summary:');
  console.log('The 211 API subscription appears to only include the Query API v2,');
  console.log('which requires organization IDs rather than keyword search.');
  console.log('');
  console.log('Next steps:');
  console.log('1. Check your 211 API portal for available API products');
  console.log('2. Look for "Search API" subscription option');
  console.log('3. If only Query API is available, we need a different approach');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

test211QueryAPI();
