#!/usr/bin/env node

import readline from 'readline';
import dotenv from 'dotenv';
import { N8nClient } from './clients/n8nClient';
import { MakeClient } from './clients/makeClient';
import { WorkflowGeneratorAgent } from './agents/workflowGeneratorAgent';
import { WorkflowModifierAgent } from './agents/workflowModifierAgent';
import { MakeToN8nAgent } from './agents/makeToN8nAgent';
import { N8nToMakeAgent } from './agents/n8nToMakeAgent';
import { findTemplatesByKeyword } from './templates/workflowTemplates';
import { searchServices } from './types/businessApis';

dotenv.config();

class WorkflowCLI {
  private rl: readline.Interface;
  private n8nClient: N8nClient | null = null;
  private makeClient: MakeClient | null = null;
  private generator: WorkflowGeneratorAgent;
  private modifier: WorkflowModifierAgent;
  private makeToN8n: MakeToN8nAgent;
  private n8nToMake: N8nToMakeAgent;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '\n💬 > '
    });

    // Initialize agents
    this.generator = new WorkflowGeneratorAgent();
    this.modifier = new WorkflowModifierAgent();
    this.makeToN8n = new MakeToN8nAgent();
    this.n8nToMake = new N8nToMakeAgent();

    // Initialize clients if configured
    if (process.env.N8N_BASE_URL && process.env.N8N_API_KEY) {
      this.n8nClient = new N8nClient(
        process.env.N8N_BASE_URL,
        process.env.N8N_API_KEY
      );
      console.log('✅ n8n client initialized');
    } else {
      console.log('⚠️  n8n not configured (set N8N_BASE_URL and N8N_API_KEY in .env)');
    }

    if (process.env.MAKE_API_TOKEN) {
      this.makeClient = new MakeClient(
        process.env.MAKE_API_TOKEN,
        process.env.MAKE_REGION || 'eu1'
      );
      console.log('✅ Make.com client initialized');
    } else {
      console.log('⚠️  Make.com not configured (set MAKE_API_TOKEN in .env)');
    }
  }

  async start() {
    console.log('\n🚀 n8n-Make Bridge CLI');
    console.log('======================\n');
    console.log('Type your request in natural language, or use commands:');
    console.log('  • generate <description> --platform n8n|make');
    console.log('  • import <id> --from n8n|make');
    console.log('  • modify <id> <instructions> --platform n8n|make');
    console.log('  • translate <id> --from n8n|make --to n8n|make');
    console.log('  • list --platform n8n|make');
    console.log('  • templates [keyword]');
    console.log('  • services [keyword]');
    console.log('  • help');
    console.log('  • exit\n');

    this.rl.prompt();

    this.rl.on('line', async (line) => {
      const input = line.trim();

      if (!input) {
        this.rl.prompt();
        return;
      }

      try {
        await this.handleInput(input);
      } catch (error) {
        console.error(`\n❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      this.rl.prompt();
    });

    this.rl.on('close', () => {
      console.log('\n👋 Goodbye!');
      process.exit(0);
    });
  }

  private async handleInput(input: string) {
    const lowerInput = input.toLowerCase();

    // Exit
    if (lowerInput === 'exit' || lowerInput === 'quit') {
      this.rl.close();
      return;
    }

    // Help
    if (lowerInput === 'help') {
      this.showHelp();
      return;
    }

    // List workflows
    if (lowerInput.startsWith('list')) {
      await this.handleList(input);
      return;
    }

    // Templates
    if (lowerInput.startsWith('templates')) {
      await this.handleTemplates(input);
      return;
    }

    // Services
    if (lowerInput.startsWith('services')) {
      await this.handleServices(input);
      return;
    }

    // Generate
    if (lowerInput.startsWith('generate')) {
      await this.handleGenerate(input);
      return;
    }

    // Import
    if (lowerInput.startsWith('import')) {
      await this.handleImport(input);
      return;
    }

    // Modify
    if (lowerInput.startsWith('modify')) {
      await this.handleModify(input);
      return;
    }

    // Translate
    if (lowerInput.startsWith('translate')) {
      await this.handleTranslate(input);
      return;
    }

    // Natural language - try to determine intent
    await this.handleNaturalLanguage(input);
  }

  private showHelp() {
    console.log('\n📚 Available Commands:\n');
    console.log('generate <description> --platform n8n|make [--create]');
    console.log('  Generate a new workflow from description\n');
    console.log('import <id> --from n8n|make');
    console.log('  Import and view an existing workflow\n');
    console.log('modify <id> <instructions> --platform n8n|make [--update]');
    console.log('  Modify an existing workflow\n');
    console.log('translate <id> --from n8n|make --to n8n|make [--create]');
    console.log('  Translate workflow between platforms\n');
    console.log('list --platform n8n|make');
    console.log('  List all workflows\n');
    console.log('templates [keyword]');
    console.log('  Search workflow templates\n');
    console.log('services [keyword]');
    console.log('  Search available service integrations\n');
    console.log('help');
    console.log('  Show this help message\n');
    console.log('exit');
    console.log('  Exit the CLI\n');
    console.log('Natural Language:');
    console.log('  Just type what you want, e.g.:');
    console.log('  "Create a workflow that reads Gmail and posts to Slack"');
    console.log('  "Show me email templates"');
    console.log('  "What Microsoft services are available?"\n');
  }

  private async handleGenerate(input: string) {
    const platformMatch = input.match(/--platform\s+(n8n|make)/i);
    const platform = platformMatch ? platformMatch[1].toLowerCase() as 'n8n' | 'make' : 'n8n';
    const shouldCreate = input.includes('--create');

    // Extract description (everything before --platform)
    const description = input
      .replace(/^generate\s+/i, '')
      .replace(/--platform\s+(n8n|make)/i, '')
      .replace(/--create/i, '')
      .trim()
      .replace(/^["']|["']$/g, ''); // Remove quotes

    if (!description) {
      console.log('❌ Please provide a description');
      return;
    }

    console.log(`\n⚙️  Generating ${platform} workflow...`);
    const result = await this.generator.generateFromDescription(description, platform);

    if (result.success && result.data) {
      console.log(`\n✅ Generated workflow: ${result.data.name}`);
      console.log(`   Nodes: ${platform === 'n8n' ? (result.data as any).nodes?.length : (result.data as any).blueprint?.flow?.length}`);

      if (result.warnings) {
        console.log(`\n⚠️  Warnings:`);
        result.warnings.forEach(w => console.log(`   - ${w}`));
      }

      if (shouldCreate) {
        if (platform === 'n8n' && this.n8nClient) {
          const created = await this.n8nClient.createWorkflow(result.data as any);
          console.log(`\n✅ Created in n8n with ID: ${created.id}`);
        } else if (platform === 'make' && this.makeClient) {
          const created = await this.makeClient.createScenario(result.data as any);
          console.log(`\n✅ Created in Make.com with ID: ${created.id}`);
        } else {
          console.log('\n⚠️  Cannot create: client not configured');
        }
      } else {
        console.log('\n💡 Add --create to create this workflow');
      }
    } else {
      console.log(`\n❌ Generation failed`);
      if (result.errors) {
        result.errors.forEach(e => console.log(`   - ${e}`));
      }
    }
  }

  private async handleImport(input: string) {
    const platformMatch = input.match(/--from\s+(n8n|make)/i);
    const platform = platformMatch ? platformMatch[1].toLowerCase() as 'n8n' | 'make' : null;

    const idMatch = input.match(/import\s+(\S+)/i);
    const id = idMatch ? idMatch[1] : null;

    if (!platform || !id) {
      console.log('❌ Usage: import <id> --from n8n|make');
      return;
    }

    console.log(`\n⚙️  Importing ${platform} workflow ${id}...`);

    if (platform === 'n8n' && this.n8nClient) {
      const workflow = await this.n8nClient.getWorkflow(id);
      console.log(`\n✅ Imported: ${workflow.name}`);
      console.log(`   Active: ${workflow.active ? '✅' : '❌'}`);
      console.log(`   Nodes: ${workflow.nodes.length}`);
      workflow.nodes.forEach((node, i) => {
        console.log(`     ${i + 1}. ${node.name} (${node.type})`);
      });
    } else if (platform === 'make' && this.makeClient) {
      const scenario = await this.makeClient.getScenario(id);
      console.log(`\n✅ Imported: ${scenario.name}`);
      const blueprint = await this.makeClient.getScenarioBlueprint(id);
      console.log(`   Modules: ${blueprint.flow?.length || 0}`);
    } else {
      console.log(`\n❌ ${platform} client not configured`);
    }
  }

  private async handleModify(input: string) {
    const platformMatch = input.match(/--platform\s+(n8n|make)/i);
    const platform = platformMatch ? platformMatch[1].toLowerCase() as 'n8n' | 'make' : null;
    const shouldUpdate = input.includes('--update');

    const parts = input.replace(/--platform\s+(n8n|make)/i, '').replace(/--update/i, '').split(/\s+/);
    const id = parts[1];
    const instructions = parts.slice(2).join(' ').replace(/^["']|["']$/g, '');

    if (!platform || !id || !instructions) {
      console.log('❌ Usage: modify <id> <instructions> --platform n8n|make [--update]');
      return;
    }

    console.log(`\n⚙️  Modifying ${platform} workflow ${id}...`);

    if (platform === 'n8n' && this.n8nClient) {
      const workflow = await this.n8nClient.getWorkflow(id);
      console.log(`   Original: ${workflow.name} (${workflow.nodes.length} nodes)`);

      const result = await this.modifier.modifyN8nWorkflow(workflow, instructions);

      if (result.success && result.data) {
        console.log(`\n✅ Modified: ${result.data.name} (${result.data.nodes.length} nodes)`);

        if (result.warnings) {
          console.log(`\n⚠️  Warnings:`);
          result.warnings.forEach(w => console.log(`   - ${w}`));
        }

        if (shouldUpdate) {
          await this.n8nClient.updateWorkflow(id, result.data);
          console.log(`\n✅ Updated in n8n`);
        } else {
          console.log(`\n💡 Add --update to save changes`);
        }
      }
    } else if (platform === 'make' && this.makeClient) {
      const scenario = await this.makeClient.getScenario(id);
      const blueprint = await this.makeClient.getScenarioBlueprint(id);
      scenario.blueprint = blueprint;

      const result = await this.modifier.modifyMakeScenario(scenario, instructions);

      if (result.success && result.data) {
        console.log(`\n✅ Modified`);

        if (shouldUpdate) {
          await this.makeClient.updateScenario(id, result.data);
          console.log(`\n✅ Updated in Make.com`);
        } else {
          console.log(`\n💡 Add --update to save changes`);
        }
      }
    } else {
      console.log(`\n❌ ${platform} client not configured`);
    }
  }

  private async handleTranslate(input: string) {
    const fromMatch = input.match(/--from\s+(n8n|make)/i);
    const toMatch = input.match(/--to\s+(n8n|make)/i);
    const from = fromMatch ? fromMatch[1].toLowerCase() as 'n8n' | 'make' : null;
    const to = toMatch ? toMatch[1].toLowerCase() as 'n8n' | 'make' : null;
    const shouldCreate = input.includes('--create');

    const idMatch = input.match(/translate\s+(\S+)/i);
    const id = idMatch ? idMatch[1] : null;

    if (!from || !to || !id) {
      console.log('❌ Usage: translate <id> --from n8n|make --to n8n|make [--create]');
      return;
    }

    console.log(`\n⚙️  Translating from ${from} to ${to}...`);

    if (from === 'n8n' && to === 'make' && this.n8nClient) {
      const workflow = await this.n8nClient.getWorkflow(id);
      const result = await this.n8nToMake.translate(workflow);

      if (result.success && result.data) {
        console.log(`\n✅ Translated: ${workflow.name}`);

        if (shouldCreate && this.makeClient) {
          const created = await this.makeClient.createScenario(result.data as any);
          console.log(`✅ Created in Make.com with ID: ${created.id}`);
        } else if (shouldCreate) {
          console.log('⚠️  Make.com client not configured');
        } else {
          console.log('💡 Add --create to create in Make.com');
        }
      }
    } else if (from === 'make' && to === 'n8n' && this.makeClient) {
      const scenario = await this.makeClient.getScenario(id);
      const blueprint = await this.makeClient.getScenarioBlueprint(id);
      scenario.blueprint = blueprint;
      const result = await this.makeToN8n.translate(scenario);

      if (result.success && result.data) {
        console.log(`\n✅ Translated: ${scenario.name}`);

        if (shouldCreate && this.n8nClient) {
          const created = await this.n8nClient.createWorkflow(result.data as any);
          console.log(`✅ Created in n8n with ID: ${created.id}`);
        } else if (shouldCreate) {
          console.log('⚠️  n8n client not configured');
        } else {
          console.log('💡 Add --create to create in n8n');
        }
      }
    } else {
      console.log(`\n❌ Required clients not configured`);
    }
  }

  private async handleList(input: string) {
    const platformMatch = input.match(/--platform\s+(n8n|make)/i);
    const platform = platformMatch ? platformMatch[1].toLowerCase() as 'n8n' | 'make' : 'n8n';

    console.log(`\n⚙️  Fetching ${platform} workflows...`);

    if (platform === 'n8n' && this.n8nClient) {
      const workflows = await this.n8nClient.getWorkflows();
      console.log(`\n✅ Found ${workflows.length} n8n workflows:\n`);
      workflows.forEach((w, i) => {
        console.log(`${i + 1}. ${w.name} (${w.id})`);
        console.log(`   Status: ${w.active ? '✅ Active' : '⏸️  Inactive'}`);
        console.log(`   Nodes: ${w.nodes.length}`);
        console.log('');
      });
    } else if (platform === 'make' && this.makeClient) {
      const scenarios = await this.makeClient.getScenarios();
      console.log(`\n✅ Found ${scenarios.length} Make.com scenarios:\n`);
      scenarios.forEach((s, i) => {
        console.log(`${i + 1}. ${s.name} (${s.id})`);
        console.log('');
      });
    } else {
      console.log(`\n❌ ${platform} client not configured`);
    }
  }

  private async handleTemplates(input: string) {
    const keyword = input.replace(/^templates\s*/i, '').trim();

    if (keyword) {
      const templates = findTemplatesByKeyword(keyword);
      console.log(`\n✅ Found ${templates.length} templates matching "${keyword}":\n`);
      templates.forEach((t, i) => {
        console.log(`${i + 1}. ${t.name} (${t.id})`);
        console.log(`   ${t.description}`);
        console.log(`   Services: ${t.requiredServices.join(', ')}`);
        console.log('');
      });
    } else {
      const templates = findTemplatesByKeyword('');
      console.log(`\n✅ All templates (${templates.length}):\n`);
      templates.forEach((t, i) => {
        console.log(`${i + 1}. ${t.name} (${t.id})`);
        console.log(`   ${t.description}`);
        console.log('');
      });
    }
  }

  private async handleServices(input: string) {
    const keyword = input.replace(/^services\s*/i, '').trim();

    if (keyword) {
      const services = searchServices(keyword);
      console.log(`\n✅ Found ${services.length} services matching "${keyword}":\n`);
      services.forEach((s, i) => {
        console.log(`${i + 1}. ${s}`);
      });
    } else {
      console.log('\n💡 Usage: services <keyword>');
      console.log('   Example: services microsoft');
      console.log('   Example: services ai');
    }
  }

  private async handleNaturalLanguage(input: string) {
    const lowerInput = input.toLowerCase();

    // Detect intent
    if (lowerInput.includes('create') || lowerInput.includes('generate') || lowerInput.includes('build')) {
      console.log('\n💡 Detected: Generate workflow');
      console.log('   Use: generate "your description" --platform n8n|make --create');
      return;
    }

    if (lowerInput.includes('show') && (lowerInput.includes('template') || lowerInput.includes('example'))) {
      await this.handleTemplates(input);
      return;
    }

    if (lowerInput.includes('what') && lowerInput.includes('service')) {
      await this.handleServices(input);
      return;
    }

    if (lowerInput.includes('list') || lowerInput.includes('show me my')) {
      await this.handleList(input + ' --platform n8n');
      return;
    }

    console.log('\n❓ Not sure what you mean. Type "help" for available commands.');
  }
}

// Start CLI
const cli = new WorkflowCLI();
cli.start().catch(console.error);
