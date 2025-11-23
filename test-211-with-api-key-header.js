/**
 * Test 211 API with different header formats
 * Based on the screenshot showing "Api-Key" header
 */

async function testWithDifferentHeaders() {
  console.log('🧪 Testing 211 API with different header formats...\n');

  const PRIMARY_KEY = '4c04c16b41264059b8b696adfbf61abd';
  const SECONDARY_KEY = '5758b34ef4c048709dd72cf01e'; // From screenshot

  const tests = [
    {
      name: 'Search API with Api-Key header (primary)',
      url: 'https://api.211.org/search/v1/records',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': PRIMARY_KEY,
      },
      body: {
        terms: 'housing',
        location: { postalCode: '68901' },
        distance: 25,
      },
    },
    {
      name: 'Search API with Api-Key header (secondary)',
      url: 'https://api.211.org/search/v1/records',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': SECONDARY_KEY,
      },
      body: {
        terms: 'housing',
        location: { postalCode: '68901' },
        distance: 25,
      },
    },
    {
      name: 'Search API v2 with Ocp header',
      url: 'https://api.211.org/search/v2/records',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': PRIMARY_KEY,
      },
      body: {
        terms: 'housing',
        location: { postalCode: '68901' },
        distance: 25,
      },
    },
    {
      name: 'GET request to search endpoint',
      url: 'https://api.211.org/search/v1/records?terms=housing&postalCode=68901&distance=25',
      headers: {
        'Api-Key': PRIMARY_KEY,
      },
      method: 'GET',
    },
  ];

  for (const test of tests) {
    console.log(`\n📍 ${test.name}`);
    console.log(`   URL: ${test.url}`);

    try {
      const response = await fetch(test.url, {
        method: test.method || 'POST',
        headers: test.headers,
        body: test.body ? JSON.stringify(test.body) : undefined,
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ SUCCESS! First few results:');
        console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ FOUND THE RIGHT ENDPOINT!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return;
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Error: ${errorText.substring(0, 200)}`);
      }
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('❌ No working endpoint found');
  console.log('');
  console.log('Please check your 211 API portal:');
  console.log('1. What API products are you subscribed to?');
  console.log('2. Is there a "Search API" option vs "Query API"?');
  console.log('3. Try the "Try it" button in the portal to see working examples');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

testWithDifferentHeaders();
