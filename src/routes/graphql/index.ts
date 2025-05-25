import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { schema } from './schemas/graphqlSchemas.js';
import { graphql, validate, parse } from 'graphql';
import depthLimit from 'graphql-depth-limit';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req, reply) {
      const { query, variables } = req.body;

      const parsedQuery = parse(query);

      const errors = validate(schema, parsedQuery, [depthLimit(5)]); // max depth 5

      if (errors.length > 0) {
        return reply.code(400).send({ errors });
      }

      return graphql({
        schema: schema,
        source: query,
        variableValues: variables,
        contextValue: { prisma: prisma },
      });
    },
  });
};

export default plugin;
