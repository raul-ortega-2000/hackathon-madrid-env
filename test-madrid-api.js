const axios = require('axios');

async function testMadridAPI() {
  console.log('🔍 Testing Madrid Air Quality API...\n');
  
  try {
    const response = await axios.get(
      'https://datos.madrid.es/egob/catalogo/212531-7916318-calidad-aire-tiempo-real.json',
      {
        timeout: 10000,
        headers: {
          'User-Agent': 'EspañaAmbiental/1.0'
        }
      }
    );
    
    console.log('✅ API Status:', response.status);
    console.log('📊 Response structure:');
    console.log('  - Has data:', !!response.data);
    console.log('  - Type:', typeof response.data);
    console.log('  - Keys:', Object.keys(response.data || {}).slice(0, 10));
    
    if (response.data) {
      const data = response.data;
      
      // Check for @graph property
      if (data['@graph']) {
        console.log('  - @graph found:', data['@graph'].length, 'stations');
        
        // Show first station structure
        if (data['@graph'][0]) {
          console.log('\n📍 First station structure:');
          console.log(JSON.stringify(data['@graph'][0], null, 2).substring(0, 800));
        }
      } else {
        console.log('  - @graph NOT found');
        console.log('  - Full keys:', Object.keys(data));
      }
    }
    
  } catch (error) {
    console.error('❌ API Error:');
    console.error('  - Message:', error.message);
    console.error('  - Code:', error.code);
    if (error.response) {
      console.error('  - Status:', error.response.status);
      console.error('  - Headers:', error.response.headers);
    }
  }
}

testMadridAPI();
