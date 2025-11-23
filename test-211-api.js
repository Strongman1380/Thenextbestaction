/**
 * Test script for 211 API integration
 * Tests the /api/generate-plan endpoint with a sample case
 */

async function test211Integration() {
  console.log('🧪 Testing 211 API Integration...\n');

  const testCase = {
    primary_need: 'housing assistance',
    urgency: 'high',
    client_initials: 'JD',
    caseworker_name: 'Test User',
    zip_code: '68901', // Hastings, NE (Next Right Step Recovery location)
    additional_context: 'Client facing eviction, needs emergency housing resources'
  };

  console.log('📝 Test Case:');
  console.log(JSON.stringify(testCase, null, 2));
  console.log('\n🔄 Sending request to /api/generate-plan...\n');

  try {
    const response = await fetch('http://localhost:3000/api/generate-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase),
    });

    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const data = await response.json();

    console.log('✅ API Response received!\n');
    console.log('📊 Metadata:', JSON.stringify(data.metadata, null, 2));
    console.log('\n📋 Case Plan:\n');
    console.log(data.case_plan);

    // Check if 211 resources are included
    if (data.case_plan.includes('211') || data.case_plan.includes('Local Resources')) {
      console.log('\n✅ 211 resources appear to be included in the case plan!');
    } else {
      console.log('\n⚠️  Warning: 211 resources may not be included. Check the case plan above.');
    }

  } catch (error) {
    console.error('❌ Error testing 211 API:', error.message);
    console.error(error);
  }
}

// Run the test
test211Integration();
