/**
 * Test if locationMode should be a header instead of query parameter
 */

async function testLocationModeAsHeader() {
  console.log('🧪 Testing locationMode as header...\n');

  const API_KEY = '5758b34ef4c048709dd72cf01ef7fdf7';

  // Try without locationMode in URL, but as a header
  const url = 'https://api.211.org/resources/v2/search/keyword?keywords=housing&location=68901';

  console.log('📍 URL:', url);
  console.log('🔑 Headers: Api-Key + locationMode\n');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Api-Key': API_KEY,
        'locationMode': 'Near',
      },
    });

    console.log(`Status: ${response.status} ${response.statusText}\n`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS with locationMode as header!');
      console.log(JSON.stringify(data, null, 2).substring(0, 1000));
    } else {
      const errorText = await response.text();
      console.log('❌ Error:');
      console.log(errorText);
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }
}

testLocationModeAsHeader();
