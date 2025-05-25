import { MemberType, Post, Profile, User } from '@prisma/client';
import DataLoader from 'dataloader';

export type Loaders = {
  user: DataLoader<string, User | null>;
  post: DataLoader<string, Post | null>;
  profile: DataLoader<string, Profile | null>;
  memberType: DataLoader<string, MemberType | null>;
  postByUserIds: DataLoader<string, Post | null>;
  profileByUserId: DataLoader<string, Profile | null>;
  userSubscribedTo: DataLoader<string, User[]>;
  subscribedToUser: DataLoader<string, User[]>;
};
