/**
 * This script initializes OpenFGA for the NeuralLog project
 * It creates a store and authorization model for API key management
 */

import { OpenFGAClient } from '@openfga/sdk';

async function main() {
  try {
    console.log('Initializing OpenFGA...');

    // Create the OpenFGA client
    const fgaClient = new OpenFGAClient({
      apiUrl: process.env.FGA_API_URL || 'http://localhost:8080',
    });

    // Create a store for NeuralLog
    console.log('Creating store...');
    const { id: storeId } = await fgaClient.createStore({
      name: 'neurallog-api-keys',
    });

    console.log(`Created store with ID: ${storeId}`);

    // Update the client with the store ID
    const clientWithStore = new OpenFGAClient({
      apiUrl: process.env.FGA_API_URL || 'http://localhost:8080',
      storeId,
    });

    // Define the authorization model with tenant type and parent-child relationships
    const authorizationModel = {
      type_definitions: [
        {
          type: 'user',
          relations: {},
        },
        {
          type: 'tenant',
          relations: {
            admin: {
              this: {},
            },
            member: {
              this: {},
            },
          },
          metadata: {
            relations: {
              admin: {
                directly_related_user_types: [
                  {
                    type: 'user',
                  },
                ],
              },
              member: {
                directly_related_user_types: [
                  {
                    type: 'user',
                  },
                ],
              },
            },
          },
        },
        {
          type: 'api_key',
          relations: {
            owner: {
              this: {},
            },
            parent: {
              this: {},
            },
            can_use: {
              union: {
                child: [
                  {
                    this: {},
                  },
                  {
                    computedUserset: {
                      relation: 'owner',
                    },
                  },
                ],
              },
            },
          },
          metadata: {
            relations: {
              owner: {
                directly_related_user_types: [
                  {
                    type: 'user',
                  },
                ],
              },
              parent: {
                directly_related_user_types: [
                  {
                    type: 'tenant',
                  },
                ],
              },
            },
          },
        },
      ],
    };

    // Create the authorization model
    console.log('Creating authorization model...');
    const { authorization_model_id } = await clientWithStore.writeAuthorizationModel(authorizationModel);

    console.log(`Created authorization model: ${authorization_model_id}`);
    console.log('\nOpenFGA initialization complete!');
    console.log(`\nStore ID: ${storeId}`);
    console.log(`Authorization Model ID: ${authorization_model_id}`);
    console.log('\nAdd these to your environment variables:');
    console.log(`FGA_STORE_ID=${storeId}`);
    console.log(`FGA_MODEL_ID=${authorization_model_id}`);
  } catch (error) {
    console.error('Error initializing OpenFGA:', error);
    process.exit(1);
  }
}

main();
