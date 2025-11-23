/**
 * Test different Search API endpoint variations
 */

async function testSearchEndpoints() {
  console.log('🧪 Testing 211 Search API endpoint variations...\n');

  const API_KEY = '5758b34ef4c048709dd72cf01ef7fdf7';

  const endpoints = [
    'https://api.211.org/resources/v2/search/records',
    'https://api.211.org/search/v2/records',
    'https://api.211.org/search/records',
    'https://api.211.org/resources/v2/search',
  ];

  const requestBody = {
    terms: 'housing',
    location: {
      postalCode: '68901'
    },
    distance: 25,
    pageSize: 10,
  };

  for (const endpoint of endpoints) {
    console.log(`\n📍 Testing: ${endpoint}`);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': API_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        console.log('\n   ✅ SUCCESS! Response:');
        console.log(JSON.stringify(data, null, 2).substring(0, 1000));
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ WORKING ENDPOINT FOUND: ${endpoint}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return endpoint;
      } else {
        const errorText = await response.text();
        console.log(`   ❌ Error: ${errorText.substring(0, 200)}`);
      }
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
    }
  }

  // Try GET request
  console.log(`\n\n📍 Testing GET request with query parameters...`);
  const getUrl = `https://api.211.org/resources/v2/search/records?terms=housing&postalCode=68901&distance=25`;
  try {
    const response = await fetch(getUrl, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': API_KEY,
      },
    });

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('\n   ✅ SUCCESS! Response:');
      console.log(JSON.stringify(data, null, 2).substring(0, 1000));
      return getUrl;
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Error: ${errorText.substring(0, 200)}`);
    }
  } catch (error) {
    console.log(`   ❌ Exception: ${error.message}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('❌ No working Search API endpoint found');
  console.log('\nPlease:');
  console.log('1. Log into https://apiportal.211.org/');
  console.log('2. Find the Search API product');
  console.log('3. Click "Try it" to see a working example');
  console.log('4. Share the exact endpoint URL that works');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

testSearchEndpoints();
