import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from 'graphql';
import {
  ChangePostInput,
  ChangeProfileInput,
  ChangeUserInput,
  CreatePostInput,
  CreateProfileInput,
  CreateUserInput,
  Post,
  Profile,
  User,
} from './basicTypes.js';
import { UUIDType } from './uuid.js';
import { ContextType } from './rootQueryType.js';

type MemberTypeId = 'BASIC' | 'BUSINESS';

export const Mutations = new GraphQLObjectType({
  name: 'Mutations',
  fields: {
    createUser: {
      type: new GraphQLNonNull(User),
      args: {
        dto: { type: new GraphQLNonNull(CreateUserInput) },
      },
      resolve: async (
        _parent,
        { dto }: { dto: { name: string; balance: number } },
        { prisma }: ContextType,
      ) => {
        return prisma.user.create({
          data: dto,
        });
      },
    },
    createProfile: {
      type: new GraphQLNonNull(Profile),
      args: { dto: { type: new GraphQLNonNull(CreateProfileInput) } },
      resolve: async (
        _parent,
        {
          dto,
        }: {
          dto: {
            isMale: boolean;
            yearOfBirth: number;
            userId: string;
            memberTypeId: MemberTypeId;
          };
        },
        { prisma }: ContextType,
      ) => {
        return prisma.profile.create({
          data: dto,
        });
      },
    },
    createPost: {
      type: new GraphQLNonNull(Post),
      args: { dto: { type: new GraphQLNonNull(CreatePostInput) } },
      resolve: async (
        _parent,
        { dto }: { dto: { title: string; content: string; authorId: string } },
        { prisma }: ContextType,
      ) => {
        return prisma.post.create({
          data: dto,
        });
      },
    },
    changePost: {
      type: new GraphQLNonNull(Post),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInput) },
      },
      resolve: async (
        _parent,
        { id, dto }: { id: string; dto: { title: string; content: string } },
        { prisma }: ContextType,
      ) => {
        return prisma.post.update({
          where: { id: id },
          data: dto,
        });
      },
    },
    changeProfile: {
      type: new GraphQLNonNull(Profile),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInput) },
      },
      resolve: async (
        _parent,
        {
          id,
          dto,
        }: {
          id: string;
          dto: { isMale: boolean; yearOfBirth: number; memberTypeId: MemberTypeId };
        },
        { prisma }: ContextType,
      ) => {
        return prisma.profile.update({
          where: { id: id },
          data: dto,
        });
      },
    },
    changeUser: {
      type: new GraphQLNonNull(User),
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInput) },
      },
      resolve: async (
        _parent,
        { id, dto }: { id: string; dto: { name: string; balance: number } },
        { prisma }: ContextType,
      ) => {
        return prisma.user.update({
          where: { id: id },
          data: dto,
        });
      },
    },
    deleteUser: {
      type: new GraphQLNonNull(GraphQLString),
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_parent, { id }: { id: string }, { prisma }: ContextType) => {
        await prisma.user.delete({
          where: {
            id: id,
          },
        });
        return id;
      },
    },
    deletePost: {
      type: new GraphQLNonNull(GraphQLString),
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_parent, { id }: { id: string }, { prisma }: ContextType) => {
        await prisma.post.delete({
          where: {
            id: id,
          },
        });
        return id;
      },
    },
    deleteProfile: {
      type: new GraphQLNonNull(GraphQLString),
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_parent, { id }: { id: string }, { prisma }: ContextType) => {
        await prisma.profile.delete({
          where: {
            id: id,
          },
        });

        return id;
      },
    },
    subscribeTo: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        _parent,
        { userId, authorId }: { userId: string; authorId: string },
        { prisma }: ContextType,
      ) => {
        await prisma.subscribersOnAuthors.create({
          data: {
            subscriberId: userId,
            authorId: authorId,
          },
        });
        return `${userId} subscribed to ${authorId}`;
      },
    },
    unsubscribeFrom: {
      type: new GraphQLNonNull(GraphQLString),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (
        _parent,
        { userId, authorId }: { userId: string; authorId: string },
        { prisma }: ContextType,
      ) => {
        await prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: userId,
              authorId: authorId,
            },
          },
        });
        return `${userId} unsubscribed from ${authorId}`;
      },
    },
  },
});
