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
const coursePaths = YAML.load(join(__dirname, '../docs/paths/courses.yaml'));
const batchPaths = YAML.load(join(__dirname, '../docs/paths/batches.yaml'));
const departmentPaths = YAML.load(join(__dirname, '../docs/paths/departments.yaml'));
const assignmentPaths = YAML.load(join(__dirname, '../docs/paths/assignments.yaml'));
const classroomPaths = YAML.load(join(__dirname, '../docs/paths/classrooms.yaml'));
const equipmentPaths = YAML.load(join(__dirname, '../docs/paths/equipment.yaml'));
const lecturePaths = YAML.load(join(__dirname, '../docs/paths/lectures.yaml'));

// Merge all paths
const spec = {
    ...baseSpec,
    paths: {
        ...authPaths,
        ...userPaths,
        ...modulePaths,
        ...coursePaths,
        ...batchPaths,
        ...departmentPaths,
        ...assignmentPaths,
        ...classroomPaths,
        ...equipmentPaths,
        ...lecturePaths
    }
};

// Configure Swagger UI options
const options = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AshBourne SCMS - Backend API Documentation'
};

export const serveApiDocs = swaggerUi.serve;
export const setupApiDocs = swaggerUi.setup(spec, options); 