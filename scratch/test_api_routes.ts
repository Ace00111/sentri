import { POST as analyzePOST } from '../src/app/api/analyze/route';
import { POST as researchPOST } from '../src/app/api/research/route';
import { POST as chatPOST } from '../src/app/api/chat/route';
import 'dotenv/config';

async function testAnalyze() {
  console.log('Testing Analyze API...');
  const req = new Request('http://localhost:3000/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' }) // vitalik.eth
  });
  
  const res = await analyzePOST(req);
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Data Type:', data.type);
  if (data.error) {
    console.error('Error:', data.error);
  } else {
    console.log('Success keys:', Object.keys(data));
  }
}

async function testResearch() {
  console.log('\nTesting Research API...');
  const req = new Request('http://localhost:3000/api/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenQuery: 'UNI' })
  });
  
  const res = await researchPOST(req);
  console.log('Status:', res.status);
  const data = await res.json();
  if (data.error) {
    console.error('Error:', data.error);
  } else {
    console.log('Success keys:', Object.keys(data));
  }
}

async function testChat() {
  console.log('\nTesting Chat API...');
  const req = new Request('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] })
  });
  
  const res = await chatPOST(req);
  console.log('Status:', res.status);
}

async function main() {
  await testAnalyze();
  await testResearch();
  await testChat();
}

main().catch(console.error);
