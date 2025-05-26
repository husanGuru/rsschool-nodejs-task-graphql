import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLResolveInfo,
} from 'graphql';
import { MemberType, MemberTypeIdEnum, Post, Profile, User } from './basicTypes.js';
import { UUIDType } from './uuid.js';
import { Prisma, PrismaClient } from '@prisma/client';
import { Loaders } from '../loaders/loaderTypes.js';
import { parseResolveInfo } from 'graphql-parse-resolve-info';

export type ContextType = { prisma: PrismaClient; loaders: Loaders };

interface UserWithOptionalSubs {
  id: string;
  name: string;
  userSubscribedTo?: { author: unknown }[];
  subscribedToUser?: { subscriber: unknown }[];
}

export const RootQueryType = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MemberType))),
      resolve: async (_obj, _args, { prisma }: ContextType) => {
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

        return memberType;
      },
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User))),
      resolve: async (
        _parent,
        _args,
        { prisma, loaders }: ContextType,
        info: GraphQLResolveInfo,
      ) => {
        const parsed = parseResolveInfo(info);
        const fields = parsed?.fieldsByTypeName?.User ?? {};

        switch (true) {
          case 'userSubscribedTo' in fields && 'subscribedToUser' in fields: {
            const users = await prisma.user.findMany({
              include: {
                userSubscribedTo: true,
                subscribedToUser: true,
              },
            });

            for (const user of users) {
              if (user.userSubscribedTo) {
                loaders.userSubscribedTo.prime(
                  user.id,
                  user.userSubscribedTo.map((v) => ({ id: v.authorId })),
                );
              }

              if (user.subscribedToUser) {
                loaders.subscribedToUser.prime(
                  user.id,
                  user.subscribedToUser.map((v) => ({ id: v.subscriberId })),
                );
              }
            }

            return users;
          }
          case 'userSubscribedTo' in fields: {
            const users = await prisma.user.findMany({
              include: {
                userSubscribedTo: true,
              },
            });

            for (const user of users) {
              if (user.userSubscribedTo) {
                loaders.userSubscribedTo.prime(
                  user.id,
                  user.userSubscribedTo.map((v) => ({ id: v.authorId })),
                );
              }
            }

            return users;
          }
          case 'subscribedToUser' in fields: {
            const users = await prisma.user.findMany({
              include: {
                subscribedToUser: true,
              },
            });

            for (const user of users) {
              if (user.subscribedToUser) {
                loaders.subscribedToUser.prime(
                  user.id,
                  user.subscribedToUser.map((v) => ({ id: v.subscriberId })),
                );
              }
            }

            return users;
          }

          default: {
            const users = await prisma.user.findMany();

            return users;
          }
        }
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
          // include: {
          //   profile: {
          //     include: {
          //       memberType: true,
          //     },
          //   },
          //   posts: true,
          // },
        });

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
          // include: {
          //   memberType: true,
          // },
        });

        return profile;
      },
    },
  },
});
