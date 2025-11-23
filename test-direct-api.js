/**
 * Direct test of 211 API to debug locationMode issue
 */

async function testDirectAPI() {
  console.log('🧪 Testing 211 API directly...\n');

  const API_KEY = '5758b34ef4c048709dd72cf01ef7fdf7';

  // Test with exact URL from user's working example
  const url = 'https://api.211.org/resources/v2/search/keyword?keywords=housing&location=68901&locationMode=Near';

  console.log('📍 URL:', url);
  console.log('🔑 Using Api-Key header\n');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Api-Key': API_KEY,
      },
    });

    console.log(`✅ Status: ${response.status} ${response.statusText}\n`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Response:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Error Response:');
      console.log(errorText);
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }
}

testDirectAPI();
