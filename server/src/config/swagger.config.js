import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import yaml from 'js-yaml';

// Get current directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load OpenAPI YAML specification
const yamlFilePath = join(__dirname, '../docs/openapi.yaml');
const yamlContent = readFileSync(yamlFilePath, 'utf8');
const swaggerSpec = yaml.load(yamlContent);

export default swaggerSpec;
