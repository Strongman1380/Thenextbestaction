/**
 * Test with all parameters as headers (locationMode + distance + etc.)
 */

async function testCompleteHeaders() {
  console.log('🧪 Testing with complete header set...\n');

  const API_KEY = '5758b34ef4c048709dd72cf01ef7fdf7';

  const url = 'https://api.211.org/resources/v2/search/keyword?keywords=housing&location=68901';

  console.log('📍 URL:', url);
  console.log('🔑 Headers: Api-Key + locationMode + distance + size + orderByDistance\n');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Api-Key': API_KEY,
        'locationMode': 'Near',
        'distance': '25',
        'size': '10',
        'orderByDistance': 'true',
      },
    });

    console.log(`Status: ${response.status} ${response.statusText}\n`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅✅✅ SUCCESS! ✅✅✅\n');
      console.log(`Found ${data.count} resources!\n`);
      console.log('First 3 results:');
      data.results.slice(0, 3).forEach((result, i) => {
        console.log(`\n${i + 1}. ${result.nameOrganization}`);
        console.log(`   Service: ${result.nameService || 'N/A'}`);
        if (result.address) {
          console.log(`   Address: ${result.address.streetAddress}, ${result.address.city}, ${result.address.stateProvince}`);
        }
      });
    } else {
      const errorText = await response.text();
      console.log('❌ Error:');
      console.log(errorText);
    }
  } catch (error) {
    console.log('❌ Exception:', error.message);
  }
}

testCompleteHeaders();
