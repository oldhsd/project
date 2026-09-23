import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/models';
import { emailSchema } from '@/lib/content-schema';
import { connectDB } from '@/lib/mongodb';
import { rateLimit } from '@/lib/rate-limit';

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: process.env.AUTH_TRUST_HOST === 'true',
  providers: [Credentials({
    credentials: { email: {}, password: {} },
    async authorize(credentials) {
      const parsed = z.object({ email: emailSchema, password: z.string().min(8).max(200) }).safeParse(credentials);
      if (!parsed.success) return null;
      await rateLimit('login', parsed.data.email, 20);
      await connectDB();
      const user = await db.students.findOne({ email: parsed.data.email, isActive: true }).select('+password').lean();
      if (!user || !(await bcrypt.compare(parsed.data.password, String(user.password)))) return null;
      return { id: String(user._id), email: String(user.email), name: String(user.name), role: String(user.role) };
    },
  })],
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 },
  pages: { signIn: '/login' },
  callbacks: {
    jwt({ token, user }) { if (user) token.role = user.role; return token; },
    session({ session, token }) {
      if (session.user) { session.user.id = token.sub!; session.user.role = token.role as string; }
      return session;
    },
    redirect({ url, baseUrl }) { return url.startsWith('/') && !url.startsWith('//') ? `${baseUrl}${url}` : new URL(url).origin === baseUrl ? url : baseUrl; },
  },
});
