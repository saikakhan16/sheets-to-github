#!/usr/bin/env node
/**
 * test-pipeline.js
 * Test the full Google Sheets → Claude → GitHub pipeline locally
 * 
 * Usage:
 *   node test-pipeline.js
 */

require('dotenv').config();
const https = require('https');

const {
  GOOGLE_SHEET_ID,
  GOOGLE_ACCESS_TOKEN,
  ANTHROPIC_API_KEY,
  GITHUB_TOKEN,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_BRANCH = 'main',
} = process.env;

const missing = ['GOOGLE_SHEET_ID','GOOGLE_ACCESS_TOKEN','ANTHROPIC_API_KEY','GITHUB_TOKEN','GITHUB_OWNER','GITHUB_REPO']
  .filter(k => !process.env[k]);
if (missing.length) {
  console.error(`\n❌  Missing env vars: ${missing.join(', ')}\n`);
  process.exit(1);
}

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data), raw: data }); }
        catch { resolve({ status: res.statusCode, body: null, raw: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function step(n, label) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  Step ${n}: ${label}`);
  console.log('─'.repeat(60));
}

(async () => {
  console.log('\n🚀  Google Sheets → Claude → GitHub pipeline');

  // Step 1: Fetch Google Sheet
  step(1, 'Fetch Google Sheet data');
  const sheetsRes = await request({
    hostname: 'sheets.googleapis.com',
    path: `/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Sheet1!A1:Z1000`,
    headers: { 'Authorization': `Bearer ${GOOGLE_ACCESS_TOKEN}` }
  });

  if (sheetsRes.status !== 200) {
    console.error('❌  Google Sheets error:', sheetsRes.status, sheetsRes.raw.slice(0,200));
    process.exit(1);
  }

  const rows = sheetsRes.body.values || [];
  if (rows.length < 2) { console.error('❌  No data in sheet.'); process.exit(1); }

  const headers = rows[0];
  const employees = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i] || '');
    return obj;
  }).filter(e => e.Name);

  console.log(`✅  Got ${employees.length} employees from sheet`);
  console.log('   Headers:', headers.join(', '));

  // Step 2: Generate with Claude
  step(2, 'Generate React component with Claude');

  const systemPrompt = `You are a senior frontend developer. Generate production-ready React TypeScript components with Tailwind CSS. Output ONLY TSX code, no markdown, no explanations. Export as: export const EmployeeDirectory = () => { ... } and end with export default EmployeeDirectory;`;
  const userPrompt = `Create a beautiful Employee Directory React component with this data:\n\n${JSON.stringify(employees, null, 2)}\n\nRequirements:\n- Each employee as a card with avatar initials, name, role, email, department\n- Grid layout (3 cols desktop, 1 mobile)\n- Department color badges\n- Search bar at top\n- Professional design with hover effects`;

  const claudePayload = JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  const claudeRes = await request({
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(claudePayload)
    }
  }, claudePayload);

  if (claudeRes.status !== 200) {
    console.error('❌  Claude error:', claudeRes.status, claudeRes.raw.slice(0,200));
    process.exit(1);
  }

  let code = claudeRes.body?.content?.[0]?.text || '';
  code = code.replace(/^```[\w]*\n?/gm,'').replace(/^```$/gm,'').trim();
  console.log(`✅  Generated ${code.length} chars of TSX`);
  console.log('\n--- Preview (first 300 chars) ---');
  console.log(code.slice(0, 300));
  console.log('--- end preview ---');

  // Step 3: Push to GitHub
  step(3, 'Push to GitHub');
  const filePath = 'src/components/generated/EmployeeDirectory.tsx';
  const encoded = Buffer.from(code, 'utf-8').toString('base64');
  const commitMsg = `feat: auto-generate EmployeeDirectory from Google Sheets\n\nTotal: ${employees.length} employees\n[skip ci]`;

  const githubHeaders = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'sheets-to-github'
  };

  // Check if file exists
  const checkRes = await request({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
    headers: githubHeaders
  });

  const fileExists = checkRes.status === 200;
  const githubBody = JSON.stringify({
    message: commitMsg,
    content: encoded,
    branch: GITHUB_BRANCH,
    ...(fileExists ? { sha: checkRes.body?.sha } : {})
  });

  const pushRes = await request({
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
    method: 'PUT',
    headers: { ...githubHeaders, 'content-type': 'application/json', 'content-length': Buffer.byteLength(githubBody) }
  }, githubBody);

  if (pushRes.status === 200 || pushRes.status === 201) {
    const url = pushRes.body?.commit?.html_url || `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`;
    console.log(`✅  ${fileExists ? 'Updated' : 'Created'}: ${filePath}`);
    console.log(`   Commit: ${url}`);
  } else {
    console.error('❌  GitHub push failed:', pushRes.status, pushRes.raw.slice(0,200));
    process.exit(1);
  }

  console.log('\n🎉  Pipeline complete!\n');
})();
