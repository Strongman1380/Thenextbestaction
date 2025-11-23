#!/usr/bin/env node

/**
 * Import Treatment Providers from TSV file into organizational-knowledge.json
 *
 * Usage:
 *   node scripts/import-treatment-providers.js
 *
 * This script reads the "Treatment/treatment providers" TSV file and converts it
 * into the local_partnerships format for the knowledge base.
 */

const fs = require('fs');
const path = require('path');

// File paths
const TSV_FILE = path.join(__dirname, '..', 'Treatment', 'treatment providers');
const KNOWLEDGE_BASE_FILE = path.join(__dirname, '..', 'data', 'organizational-knowledge.json');

// Read and parse TSV file
function parseTSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  if (lines.length === 0) return [];

  // First line is headers
  const headers = lines[0].split('\t');

  // Find relevant column indices
  const nameIdx1 = headers.indexOf('name1');
  const nameIdx2 = headers.indexOf('name2');
  const streetIdx1 = headers.indexOf('street1');
  const streetIdx2 = headers.indexOf('street2');
  const cityIdx = headers.indexOf('city');
  const stateIdx = headers.indexOf('state');
  const zipIdx = headers.indexOf('zip');
  const phoneIdx = headers.indexOf('phone');
  const intakeIdx1 = headers.indexOf('intake1');
  const intakeIdx2 = headers.indexOf('intake2');
  const websiteIdx = headers.indexOf('website');
  const typeIdx = headers.indexOf('type_facility');
  const mhIdx = headers.indexOf('mh'); // Mental health
  const saIdx = headers.indexOf('sa'); // Substance abuse

  const providers = [];

  // Parse each data line (skip header)
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');

    // Skip if not enough columns
    if (cols.length < 10) continue;

    const name1 = cols[nameIdx1]?.trim() || '';
    const name2 = cols[nameIdx2]?.trim() || '';
    const street1 = cols[streetIdx1]?.trim() || '';
    const street2 = cols[streetIdx2]?.trim() || '';
    const city = cols[cityIdx]?.trim() || '';
    const state = cols[stateIdx]?.trim() || '';
    const zip = cols[zipIdx]?.trim() || '';
    const phone = cols[phoneIdx]?.trim() || '';
    const intake1 = cols[intakeIdx1]?.trim() || '';
    const intake2 = cols[intakeIdx2]?.trim() || '';
    const website = cols[websiteIdx]?.trim() || '';
    const type = cols[typeIdx]?.trim() || '';
    const hasMH = cols[mhIdx] === '1';
    const hasSA = cols[saIdx] === '1';

    // Skip if missing essential data
    if (!name1 || !city) continue;

    // Build full name
    let fullName = name1;
    if (name2) {
      fullName += ` - ${name2}`;
    }

    // Build address
    let address = street1;
    if (street2) address += ` ${street2}`;
    if (city) address += `, ${city}`;
    if (state) address += `, ${state}`;
    if (zip) address += ` ${zip}`;

    // Determine service types
    const services = [];
    if (hasMH) services.push('Mental Health');
    if (hasSA) services.push('Substance Abuse Treatment');
    if (type === 'MH') services.push('Mental Health Services');
    if (type === 'SU') services.push('Substance Use Services');

    // Build services description
    let servicesDesc = services.length > 0 ? services.join(', ') : 'Behavioral Health Services';

    // Build contact info
    let contact = '';
    if (phone) contact += `Phone: ${phone}`;
    if (intake1) contact += ` | Intake: ${intake1}`;
    if (intake2) contact += ` | Alt Intake: ${intake2}`;
    if (website) contact += ` | ${website}`;

    providers.push({
      organization: fullName,
      services: servicesDesc,
      contact: contact || 'Contact info not available',
      address: address,
      location: `${city}, ${state}`,
      notes: ''
    });
  }

  return providers;
}

// Main function
function main() {
  console.log('🔄 Importing treatment providers...\n');

  // Check if TSV file exists
  if (!fs.existsSync(TSV_FILE)) {
    console.error(`❌ Error: Treatment providers file not found at ${TSV_FILE}`);
    process.exit(1);
  }

  // Parse TSV file
  console.log(`📖 Reading from: ${TSV_FILE}`);
  const providers = parseTSV(TSV_FILE);
  console.log(`✅ Found ${providers.length} treatment providers\n`);

  // Load existing knowledge base
  let knowledgeBase;
  if (fs.existsSync(KNOWLEDGE_BASE_FILE)) {
    console.log(`📖 Loading existing knowledge base: ${KNOWLEDGE_BASE_FILE}`);
    knowledgeBase = JSON.parse(fs.readFileSync(KNOWLEDGE_BASE_FILE, 'utf-8'));
  } else {
    console.log('⚠️  Knowledge base not found, creating new one');
    knowledgeBase = {
      organization: {
        name: "Next Right Step Recovery",
        location: "Hastings, NE 68901",
        mission: "Trauma-informed recovery support and case management",
        philosophy: "Compassion in the chaos. Accountability without shame. Hope that's practical, not pie-in-the-sky."
      },
      internal_resources: [],
      local_partnerships: [],
      best_practices: {},
      common_referral_paths: {},
      staff_contacts: {},
      client_forms_documents: [],
      community_specific_info: {}
    };
  }

  // Add treatment providers to local_partnerships
  // Keep any existing partnerships that aren't treatment providers
  const existingNonTreatment = (knowledgeBase.local_partnerships || []).filter(
    partner => !partner.organization.includes('Treatment Provider')
  );

  knowledgeBase.local_partnerships = [
    ...existingNonTreatment,
    ...providers
  ];

  // Save updated knowledge base
  console.log(`💾 Saving to: ${KNOWLEDGE_BASE_FILE}`);
  fs.writeFileSync(
    KNOWLEDGE_BASE_FILE,
    JSON.stringify(knowledgeBase, null, 2),
    'utf-8'
  );

  console.log(`\n✅ Success! Imported ${providers.length} treatment providers`);
  console.log(`📊 Total local partnerships: ${knowledgeBase.local_partnerships.length}`);
  console.log(`\n🎯 Next steps:`);
  console.log(`   1. Review data/organizational-knowledge.json`);
  console.log(`   2. Add any missing information or notes`);
  console.log(`   3. Commit changes: git add data/organizational-knowledge.json`);
  console.log(`   4. Deploy: git push origin main`);
}

main();
