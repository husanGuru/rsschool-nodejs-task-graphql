import { GraphQLSchema } from 'graphql';
import { RootQueryType } from '../types/rootQueryType.js';
import { Mutations } from '../types/mutations.js';

export const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: Mutations,
});
