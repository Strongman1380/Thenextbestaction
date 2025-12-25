#!/usr/bin/env node

/**
 * Import Treatment Providers from knowledge files into treatment-providers.json
 * and update organizational-knowledge.json
 *
 * Usage:
 *   node scripts/import-treatment-providers.js
 *
 * This script reads treatment provider files from the knoweldge directory
 * and creates structured data for the AI knowledge base.
 */

const fs = require('fs');
const path = require('path');

// File paths
const KNOWLEDGE_DIR = path.join(__dirname, '..', 'knoweldge');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'treatment-providers.json');
const KNOWLEDGE_BASE_FILE = path.join(__dirname, '..', 'data', 'organizational-knowledge.json');

function parseCSV(content, delimiter = ',') {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(delimiter).map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter);
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] || '').trim();
    });
    rows.push(row);
  }

  return rows;
}

function parseTSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split('\t').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t');
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] || '').trim();
    });
    rows.push(row);
  }

  return rows;
}

function parseDetoxCenters() {
  const filePath = path.join(KNOWLEDGE_DIR, 'Detox Centers');
  if (!fs.existsSync(filePath)) {
    console.log('  - Detox Centers file not found, skipping');
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseTSV(content);

  return rows.map(row => ({
    name: [row.name1, row.name2].filter(Boolean).join(' - '),
    type: 'detox',
    address: [row.street1, row.street2].filter(Boolean).join(' '),
    city: row.city,
    state: row.state,
    zip: row.zip,
    county: row.county,
    phone: row.phone,
    intakePhone: row.intake1 || row.intake2 || null,
    website: row.website,
    services: ['Detoxification', 'Substance Use Disorder Treatment']
  })).filter(p => p.name && p.city);
}

function parseHalfwayHouses() {
  const filePath = path.join(KNOWLEDGE_DIR, 'Halfways Houses');
  if (!fs.existsSync(filePath)) {
    console.log('  - Halfway Houses file not found, skipping');
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseTSV(content);

  return rows.map(row => ({
    name: [row.name1, row.name2].filter(Boolean).join(' - '),
    type: 'halfway_house',
    address: [row.street1, row.street2].filter(Boolean).join(' '),
    city: row.city,
    state: row.state,
    zip: row.zip,
    county: row.county,
    phone: row.phone,
    intakePhone: row.intake1 || row.intake2 || null,
    website: row.website,
    services: ['Transitional Housing', 'Recovery Support', 'Substance Use Recovery']
  })).filter(p => p.name && p.city);
}

function parseOutpatient() {
  const filePath = path.join(KNOWLEDGE_DIR, 'Outpatient');
  if (!fs.existsSync(filePath)) {
    console.log('  - Outpatient file not found, skipping');
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseTSV(content);

  return rows.map(row => {
    const services = [];

    // Parse service flags
    if (row.mh === '1') services.push('Mental Health');
    if (row.sa === '1') services.push('Substance Abuse');
    if (row.dt === '1') services.push('Detox');
    if (row.mm === '1') services.push('Medication Management');
    if (row.otp === '1') services.push('Opioid Treatment Program');
    if (row.cbt === '1') services.push('Cognitive Behavioral Therapy');
    if (row.dbt === '1') services.push('Dialectical Behavioral Therapy');
    if (row.tele === '1') services.push('Telehealth');
    if (row.trma === '1') services.push('Trauma Treatment');
    if (row.ptsd === '1') services.push('PTSD Treatment');
    if (row.vet === '1') services.push('Veterans Services');
    if (row.ped === '1') services.push('Pediatric/Youth Services');
    if (row.peer === '1') services.push('Peer Support');
    if (row.cm === '1') services.push('Case Management');

    const facilityType = row.type_facility === 'MH' ? 'Mental Health' :
                         row.type_facility === 'SU' ? 'Substance Use' : 'General';

    return {
      name: [row.name1, row.name2].filter(Boolean).join(' - '),
      type: 'outpatient',
      facilityType,
      address: [row.street1, row.street2].filter(Boolean).join(' '),
      city: row.city,
      state: row.state,
      zip: row.zip,
      county: row.county,
      phone: row.phone,
      intakePhone: row.intake1 || row.intake2 || null,
      website: row.website,
      latitude: row.latitude ? parseFloat(row.latitude) : null,
      longitude: row.longitude ? parseFloat(row.longitude) : null,
      services: services.length > 0 ? services : ['Outpatient Treatment']
    };
  }).filter(p => p.name && p.city);
}

function parseResidential() {
  const filePath = path.join(KNOWLEDGE_DIR, 'residential');
  if (!fs.existsSync(filePath)) {
    console.log('  - Residential file not found, skipping');
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseTSV(content);

  return rows.map(row => {
    const services = [];

    // Parse service flags
    if (row.mh === '1') services.push('Mental Health');
    if (row.sa === '1') services.push('Substance Abuse');
    if (row.dt === '1') services.push('Detox');
    if (row.mm === '1') services.push('Medication Management');
    if (row.cbt === '1') services.push('Cognitive Behavioral Therapy');
    if (row.dbt === '1') services.push('Dialectical Behavioral Therapy');
    if (row.trma === '1') services.push('Trauma Treatment');
    if (row.ptsd === '1') services.push('PTSD Treatment');
    if (row.vet === '1') services.push('Veterans Services');
    if (row.ped === '1') services.push('Pediatric/Youth Services');
    if (row.peer === '1') services.push('Peer Support');
    if (row.hh === '1') services.push('Halfway House');

    const facilityType = row.type_facility === 'MH' ? 'Mental Health' :
                         row.type_facility === 'SU' ? 'Substance Use' : 'General';

    return {
      name: [row.name1, row.name2].filter(Boolean).join(' - '),
      type: 'residential',
      facilityType,
      address: [row.street1, row.street2].filter(Boolean).join(' '),
      city: row.city,
      state: row.state,
      zip: row.zip,
      county: row.county,
      phone: row.phone,
      intakePhone: row.intake1 || row.intake2 || null,
      website: row.website,
      latitude: row.latitude ? parseFloat(row.latitude) : null,
      longitude: row.longitude ? parseFloat(row.longitude) : null,
      services: services.length > 0 ? services : ['Residential Treatment']
    };
  }).filter(p => p.name && p.city);
}

function parseOtherResources() {
  const filePath = path.join(KNOWLEDGE_DIR, 'Other resources');
  if (!fs.existsSync(filePath)) {
    console.log('  - Other resources file not found, skipping');
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows = parseCSV(content);

  return rows.map(row => ({
    name: [row['Organization Name'], row['Program/Branch']].filter(Boolean).join(' - '),
    type: 'community_resource',
    category: row['Category'] || 'General',
    address: row['Address'],
    city: row['City'],
    state: row['State'],
    zip: row['Zip'],
    county: row['County'],
    phone: row['Phone Number'],
    website: row['Website'],
    services: [row['Category'] || 'Community Support']
  })).filter(p => p.name && p.city);
}

function updateKnowledgeBase(providers) {
  let knowledgeBase;

  if (fs.existsSync(KNOWLEDGE_BASE_FILE)) {
    knowledgeBase = JSON.parse(fs.readFileSync(KNOWLEDGE_BASE_FILE, 'utf-8'));
  } else {
    console.log('  Knowledge base not found, creating default');
    knowledgeBase = {
      organization: {
        name: "Epworth Village",
        location: "York, NE 68467",
        mission: "Trauma-informed recovery support and case management",
        philosophy: "Compassion in the chaos. Accountability without shame."
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

  // Convert providers to local_partnerships format for the knowledge base
  const allProviders = [
    ...providers.detox,
    ...providers.halfway_houses,
    ...providers.outpatient.slice(0, 100), // Limit to keep file manageable
    ...providers.residential.slice(0, 100),
    ...providers.community_resources
  ];

  const partnerships = allProviders.map(p => ({
    organization: p.name,
    services: p.services.join(', '),
    contact: [
      p.phone ? `Phone: ${p.phone}` : null,
      p.intakePhone ? `Intake: ${p.intakePhone}` : null,
      p.website || null
    ].filter(Boolean).join(' | ') || 'Contact info not available',
    address: [p.address, p.city, p.state, p.zip].filter(Boolean).join(', '),
    location: `${p.city}, ${p.state}`,
    notes: p.county ? `County: ${p.county}` : ''
  }));

  knowledgeBase.local_partnerships = partnerships;

  // Add treatment-specific best practices
  knowledgeBase.best_practices = {
    ...knowledgeBase.best_practices,
    detox: [
      "Always assess withdrawal risk before referral",
      "Verify bed availability before sending client",
      "Provide warm handoff when possible",
      "Follow up within 24 hours of admission"
    ],
    residential_treatment: [
      "Complete full assessment before referral",
      "Gather insurance and identification documents",
      "Prepare client for treatment expectations",
      "Coordinate with aftercare planning from day one"
    ],
    outpatient_treatment: [
      "Match intensity to client needs (IOP vs OP)",
      "Consider transportation barriers",
      "Coordinate with other providers",
      "Monitor attendance and engagement"
    ],
    halfway_house: [
      "Ensure client is stable before placement",
      "Review house rules with client beforehand",
      "Coordinate with treatment providers",
      "Plan for employment and housing goals"
    ]
  };

  fs.writeFileSync(KNOWLEDGE_BASE_FILE, JSON.stringify(knowledgeBase, null, 2));
  console.log(`  Updated ${KNOWLEDGE_BASE_FILE}`);
}

function main() {
  console.log('Parsing treatment provider files...\n');

  // Check if knowledge directory exists
  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    console.error(`Error: Knowledge directory not found at ${KNOWLEDGE_DIR}`);
    process.exit(1);
  }

  const providers = {
    detox: parseDetoxCenters(),
    halfway_houses: parseHalfwayHouses(),
    outpatient: parseOutpatient(),
    residential: parseResidential(),
    community_resources: parseOtherResources(),
    metadata: {
      lastUpdated: new Date().toISOString(),
      sources: [
        'Nebraska Treatment Provider Database',
        'Community Resources Directory'
      ],
      totalProviders: 0
    }
  };

  providers.metadata.totalProviders =
    providers.detox.length +
    providers.halfway_houses.length +
    providers.outpatient.length +
    providers.residential.length +
    providers.community_resources.length;

  console.log(`Parsed ${providers.detox.length} detox centers`);
  console.log(`Parsed ${providers.halfway_houses.length} halfway houses`);
  console.log(`Parsed ${providers.outpatient.length} outpatient facilities`);
  console.log(`Parsed ${providers.residential.length} residential facilities`);
  console.log(`Parsed ${providers.community_resources.length} community resources`);
  console.log(`Total: ${providers.metadata.totalProviders} providers\n`);

  // Ensure data directory exists
  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Save treatment providers JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(providers, null, 2));
  console.log(`Saved treatment providers to ${OUTPUT_FILE}`);

  // Update organizational knowledge base
  console.log('\nUpdating organizational knowledge base...');
  updateKnowledgeBase(providers);

  console.log('\nDone! Treatment providers have been imported.');
}

main();
