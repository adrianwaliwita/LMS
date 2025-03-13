import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the OpenAPI specification files
const baseSpec = YAML.load(join(__dirname, '../docs/openapi.yaml'));
const authPaths = YAML.load(join(__dirname, '../docs/paths/auth.yaml'));
const userPaths = YAML.load(join(__dirname, '../docs/paths/users.yaml'));
const modulePaths = YAML.load(join(__dirname, '../docs/paths/modules.yaml'));

// Merge all paths
const spec = {
    ...baseSpec,
    paths: {
        ...authPaths,
        ...userPaths,
        ...modulePaths
    }
};

// Configure Swagger UI options
const options = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AshBourne SCMS - Backend API Documentation'
};

export const serveApiDocs = swaggerUi.serve;
export const setupApiDocs = swaggerUi.setup(spec, options); 