import DataLoader from 'dataloader';
import { MemberType, Post, PrismaClient, Profile, User } from '@prisma/client';

// Batch function gets array of user IDs and returns users in same order
export function createUserLoader(prisma: PrismaClient) {
  return new DataLoader<string, User | null>(async (userIds) => {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds as string[] } },
    });

    const userMap = new Map(users.map((user) => [user.id, user]));

    return userIds.map((id) => userMap.get(id) || null);
  });
}
export function createPostLoader(prisma: PrismaClient) {
  return new DataLoader<string, Post | null>(async (postIds) => {
    const posts = await prisma.post.findMany({
      where: { id: { in: postIds as string[] } },
    });

    const postMap = new Map(posts.map((post) => [post.id, post]));

    return postIds.map((id) => postMap.get(id) || null);
  });
}

export function createProfileLoader(prisma: PrismaClient) {
  return new DataLoader<string, Profile | null>(async (profileIds) => {
    const profiles = await prisma.profile.findMany({
      where: { id: { in: profileIds as string[] } },
      include: { memberType: true },
    });

    const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));

    return profileIds.map((id) => profileMap.get(id) || null);
  });
}

export function createMemberTypeLoader(prisma: PrismaClient) {
  return new DataLoader<string, MemberType | null>(async (ids) => {
    const types = await prisma.memberType.findMany({
      where: {
        id: { in: ids as string[] }, // cast if using enum
      },
    });

    const typeMap = new Map(types.map((t) => [t.id, t]));

    return ids.map((id) => typeMap.get(id) ?? null);
  });
}

export function createPostsByUserIdsLoader(prisma: PrismaClient) {
  return new DataLoader<string, Post[]>(async (userIds) => {
    const posts = await prisma.post.findMany({
      where: {
        authorId: { in: userIds as string[] },
      },
    });

    const grouped = new Map<string, Post[]>();
    for (const id of userIds) grouped.set(id, []);

    for (const post of posts) {
      const group = grouped.get(post.authorId);
      if (group) group.push(post);
    }

    return userIds.map((id) => grouped.get(id) || []);
  });
}

export function createProfileByUserIdLoader(prisma: PrismaClient) {
  return new DataLoader<string, Profile | null>(async (userIds) => {
    const profiles = await prisma.profile.findMany({
      where: {
        userId: { in: userIds as string[] },
      },
      include: {
        memberType: true,
      },
    });

    const profileMap = new Map(profiles.map((p) => [p.userId, p]));

    return userIds.map((id) => profileMap.get(id) || null);
  });
}

export function createUserSubscribedToLoader(prisma: PrismaClient) {
  return new DataLoader<string, User[]>(async (userIds) => {
    const subscriptions = await prisma.subscribersOnAuthors.findMany({
      where: {
        subscriberId: { in: userIds as string[] },
      },
      include: {
        author: true,
      },
    });

    const map = new Map<string, User[]>();
    for (const id of userIds) map.set(id, []);

    for (const sub of subscriptions) {
      map.get(sub.subscriberId)?.push(sub.author);
    }

    return userIds.map((id) => map.get(id) ?? []);
  });
}

export function createSubscribedToUserLoader(prisma: PrismaClient) {
  return new DataLoader<string, User[]>(async (userIds) => {
    const subscriptions = await prisma.subscribersOnAuthors.findMany({
      where: {
        authorId: { in: userIds as string[] },
      },
      include: {
        subscriber: true,
      },
    });

    const map = new Map<string, User[]>();
    for (const id of userIds) map.set(id, []);

    for (const sub of subscriptions) {
      map.get(sub.authorId)?.push(sub.subscriber);
    }

    return userIds.map((id) => map.get(id) ?? []);
  });
}
