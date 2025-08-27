// Test NFC data parsing
const testNFCData = `{"type":"product","version":"1.0","data":{"productId":"1001","name":"Cap NY","price":25000,"currency":"KRW","description":"Stylish New York cap for everyday wear","image":"/products/cap-ny.jpg","merchantId":"fashion-store-001","merchantName":"Fashion Store Seoul","contractAddress":"0x9d5F1273002Cc4DAC76B72249ed59B21Ba41D526","chainId":1001,"timestamp":1724774400000}}`;

console.log('🧪 Testing NFC data parsing...\n');

try {
  // Parse the JSON
  const tagData = JSON.parse(testNFCData);
  console.log('✅ JSON parsing successful');
  console.log('📋 Tag data structure:', {
    type: tagData.type,
    version: tagData.version,
    hasData: !!tagData.data
  });
  
  if (tagData.type === 'product' && tagData.data) {
    const productData = tagData.data;
    console.log('📦 Product data:', productData);
    
    // Validate required fields
    const validation = {
      productId: !!productData.productId,
      name: !!productData.name,
      price: productData.price !== undefined && productData.price > 0,
      merchantId: !!productData.merchantId,
      contractAddress: !!productData.contractAddress
    };
    
    console.log('🔍 Validation results:', validation);
    
    const isValid = Object.values(validation).every(v => v === true);
    
    if (isValid) {
      console.log('✅ NFC data is VALID and should work!');
    } else {
      console.log('❌ NFC data is INVALID - missing fields');
    }
  } else {
    console.log('❌ Invalid tag structure');
  }
  
} catch (error) {
  console.error('❌ JSON parsing failed:', error.message);
}
