async function test() {
  console.log('Testing Analyze API...');
  try {
    const res = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' })
    });
    console.log('Analyze Status:', res.status);
    const data = await res.json();
    console.log('Analyze Response:', data);
  } catch (e) { console.error(e) }

  console.log('\nTesting Research API...');
  try {
    const res = await fetch('http://localhost:3000/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'UNI' })
    });
    console.log('Research Status:', res.status);
    const data = await res.json();
    console.log('Research Response Keys:', Object.keys(data));
  } catch (e) { console.error(e) }
}
test();
