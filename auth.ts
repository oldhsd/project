import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Credentials({ credentials: { email: {}, password: {} }, async authorize(credentials) {
    const parsed = z.object({ email: z.string().email(), password: z.string().min(8) }).safeParse(credentials);
    if (!parsed.success) return null;
    await connectDB(); const user = await User.findOne({ email: parsed.data.email }).lean() as { _id: { toString(): string }; email: string; name: string; password: string; role: string } | null;
    if (!user || !(await bcrypt.compare(parsed.data.password, user.password))) return null;
    return { id: user._id.toString(), email: user.email, name: user.name, role: user.role };
  } })],
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 }, pages: { signIn: '/login' }, callbacks: { jwt({ token, user }) { if (user) token.role = user.role as string; return token; }, session({ session, token }) { if (session.user) { session.user.id = token.sub!; (session.user as typeof session.user & { role?: string }).role = token.role as string; } return session; } }
});
