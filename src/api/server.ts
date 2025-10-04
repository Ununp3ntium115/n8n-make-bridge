import express, { Request, Response } from 'express';
import { N8nClient } from '../clients/n8nClient';
import { MakeClient } from '../clients/makeClient';
import { MakeToN8nAgent } from '../agents/makeToN8nAgent';
import { N8nToMakeAgent } from '../agents/n8nToMakeAgent';
import { TranslationContext } from '../types';

export class ApiServer {
  private app: express.Application;
  private n8nClient: N8nClient;
  private makeClient: MakeClient;
  private makeToN8nAgent: MakeToN8nAgent;
  private n8nToMakeAgent: N8nToMakeAgent;

  constructor(
    n8nBaseUrl: string,
    n8nApiKey: string,
    makeApiToken: string,
    makeRegion: string = 'eu1'
  ) {
    this.app = express();
    this.n8nClient = new N8nClient(n8nBaseUrl, n8nApiKey);
    this.makeClient = new MakeClient(makeApiToken, makeRegion);
    this.makeToN8nAgent = new MakeToN8nAgent();
    this.n8nToMakeAgent = new N8nToMakeAgent();

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // === Make to n8n Translation ===

    // Translate a specific Make scenario to n8n
    this.app.post('/translate/make-to-n8n/:scenarioId', async (req: Request, res: Response) => {
      try {
        const { scenarioId } = req.params;
        const context: TranslationContext = req.body.context || {
          sourceType: 'make',
          targetType: 'n8n',
        };

        // Fetch scenario from Make
        const scenario = await this.makeClient.getScenario(scenarioId);

        // Get blueprint
        const blueprint = await this.makeClient.getScenarioBlueprint(scenarioId);
        scenario.blueprint = blueprint;

        // Translate
        const result = await this.makeToN8nAgent.translate(scenario, context);

        if (result.success && result.data && req.body.createWorkflow) {
          // Create the workflow in n8n
          const createdWorkflow = await this.n8nClient.createWorkflow(result.data as any);
          result.data = createdWorkflow;
        }

        res.json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        });
      }
    });

    // Translate all Make scenarios to n8n
    this.app.post('/translate/make-to-n8n/batch', async (req: Request, res: Response) => {
      try {
        const { teamId, organizationId, createWorkflows } = req.body;
        const context: TranslationContext = req.body.context || {
          sourceType: 'make',
          targetType: 'n8n',
        };

        // Fetch scenarios from Make
        const scenarios = await this.makeClient.getScenarios(teamId, organizationId);

        // Fetch blueprints for each scenario
        const scenariosWithBlueprints = await Promise.all(
          scenarios.map(async (scenario) => {
            if (scenario.id) {
              const blueprint = await this.makeClient.getScenarioBlueprint(scenario.id);
              return { ...scenario, blueprint };
            }
            return scenario;
          })
        );

        // Translate
        const results = await this.makeToN8nAgent.translateBatch(scenariosWithBlueprints, context);

        // Optionally create workflows in n8n
        if (createWorkflows) {
          for (let i = 0; i < results.length; i++) {
            if (results[i].success && results[i].data) {
              try {
                const createdWorkflow = await this.n8nClient.createWorkflow(results[i].data as any);
                results[i].data = createdWorkflow;
              } catch (error) {
                results[i].errors = results[i].errors || [];
                results[i].errors!.push(`Failed to create workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            }
          }
        }

        res.json({ results });
      } catch (error) {
        res.status(500).json({
          success: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        });
      }
    });

    // === n8n to Make Translation ===

    // Translate a specific n8n workflow to Make
    this.app.post('/translate/n8n-to-make/:workflowId', async (req: Request, res: Response) => {
      try {
        const { workflowId } = req.params;
        const context: TranslationContext = req.body.context || {
          sourceType: 'n8n',
          targetType: 'make',
        };

        // Fetch workflow from n8n
        const workflow = await this.n8nClient.getWorkflow(workflowId);

        // Translate
        const result = await this.n8nToMakeAgent.translate(workflow, context);

        if (result.success && result.data && req.body.createScenario) {
          // Create the scenario in Make
          const createdScenario = await this.makeClient.createScenario(result.data as any);
          result.data = createdScenario;
        }

        res.json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        });
      }
    });

    // Translate all n8n workflows to Make
    this.app.post('/translate/n8n-to-make/batch', async (req: Request, res: Response) => {
      try {
        const { createScenarios } = req.body;
        const context: TranslationContext = req.body.context || {
          sourceType: 'n8n',
          targetType: 'make',
        };

        // Fetch workflows from n8n
        const workflows = await this.n8nClient.getWorkflows();

        // Translate
        const results = await this.n8nToMakeAgent.translateBatch(workflows, context);

        // Optionally create scenarios in Make
        if (createScenarios) {
          for (let i = 0; i < results.length; i++) {
            if (results[i].success && results[i].data) {
              try {
                const createdScenario = await this.makeClient.createScenario(results[i].data as any);
                results[i].data = createdScenario;
              } catch (error) {
                results[i].errors = results[i].errors || [];
                results[i].errors!.push(`Failed to create scenario: ${error instanceof Error ? error.message : 'Unknown error'}`);
              }
            }
          }
        }

        res.json({ results });
      } catch (error) {
        res.status(500).json({
          success: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        });
      }
    });

    // === Direct API Access ===

    // n8n workflows
    this.app.get('/n8n/workflows', async (req: Request, res: Response) => {
      try {
        const workflows = await this.n8nClient.getWorkflows();
        res.json(workflows);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.app.get('/n8n/workflows/:id', async (req: Request, res: Response) => {
      try {
        const workflow = await this.n8nClient.getWorkflow(req.params.id);
        res.json(workflow);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Make scenarios
    this.app.get('/make/scenarios', async (req: Request, res: Response) => {
      try {
        const { teamId, organizationId } = req.query;
        const scenarios = await this.makeClient.getScenarios(
          teamId as string,
          organizationId as string
        );
        res.json(scenarios);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.app.get('/make/scenarios/:id', async (req: Request, res: Response) => {
      try {
        const scenario = await this.makeClient.getScenario(req.params.id);
        res.json(scenario);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.app.get('/make/scenarios/:id/blueprint', async (req: Request, res: Response) => {
      try {
        const blueprint = await this.makeClient.getScenarioBlueprint(req.params.id);
        res.json(blueprint);
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });
  }

  start(port: number = 3000) {
    this.app.listen(port, () => {
      console.log(`🚀 n8n-Make.com Bridge API Server running on port ${port}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
    });
  }

  getApp() {
    return this.app;
  }
}
