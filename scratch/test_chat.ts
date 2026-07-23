import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join('=').trim().replace(/^"|"$/g, '');
      }
    }
  }
}

import { runCopilotChatService } from '../src/services/copilot';

async function testChat() {
  console.log('--- TESTING AI CHAT STREAMING ---');
  try {
    const response = runCopilotChatService({
      messages: [{ role: 'user', content: 'What is Sentri?' }]
    });
    console.log('Chat Response status:', response.status);
    const text = await response.text();
    console.log('Chat Response Text (first 200 chars):', text.substring(0, 200));
  } catch (err) {
    console.error('Chat Service Error:', err);
  }
}

testChat();
