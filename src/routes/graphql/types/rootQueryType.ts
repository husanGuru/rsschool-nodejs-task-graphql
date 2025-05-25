import { GraphQLObjectType, GraphQLNonNull, GraphQLList } from 'graphql';
import { MemberType, MemberTypeIdEnum, Post, Profile, User } from './basicTypes.js';
import { UUIDType } from './uuid.js';
import { PrismaClient } from '@prisma/client';
import { httpErrors } from '@fastify/sensible';

type ContextType = { prisma: PrismaClient };

export const RootQueryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
      resolve: async (_obj, args, { prisma }: ContextType) => {
        return prisma.memberType.findMany();
      },
    },
    memberType: {
      type: MemberType,
      args: { id: { type: new GraphQLNonNull(MemberTypeIdEnum) } },
      resolve: async (
        _parent,
        args: { id: 'BASIC' | 'BUSINESS' },
        { prisma }: ContextType,
      ) => {
        const memberType = await prisma.memberType.findUnique({
          where: {
            id: args.id,
          },
        });
        // if (memberType === null) {
        //   throw httpErrors.notFound();
        // }
        return memberType;
      },
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (_parent, _args, { prisma }: ContextType) => {
        const result = await prisma.user.findMany({
          include: {
            profile: {
              include: {
                memberType: true,
              },
            },

            posts: true,
            userSubscribedTo: true,
            subscribedToUser: true,
          },
        });

        return result ?? [];
      },
    },
    user: {
      type: User,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_parent, args: { id: string }, { prisma }: ContextType) => {
        const user = await prisma.user.findUnique({
          where: {
            id: args.id,
          },
          include: {
            profile: {
              include: {
                memberType: true,
              },
            },
            posts: true,
            userSubscribedTo: true,
            subscribedToUser: true,
          },
        });
        // if (user === null) {
        //   throw httpErrors.notFound();
        // }
        return user;
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post))),
      resolve: async (_parent, _args, { prisma }: ContextType) => {
        return prisma.post.findMany();
      },
    },
    post: {
      type: Post,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_parent, args: { id: string }, { prisma }: ContextType) => {
        const post = await prisma.post.findUnique({
          where: {
            id: args.id,
          },
        });
        // if (post === null) {
        //   throw httpErrors.notFound();
        // }
        return post;
      },
    },
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Profile))),
      resolve: async (_parent, _args, { prisma }: ContextType) => {
        return prisma.profile.findMany();
      },
    },
    profile: {
      type: Profile,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_parent, args: { id: string }, { prisma }: ContextType) => {
        const profile = await prisma.profile.findUnique({
          where: {
            id: args.id,
          },
          include: {
            memberType: true,
          },
        });
        // if (profile === null) {
        //   throw httpErrors.notFound();
        // }
        return profile;
      },
    },
  },
});
