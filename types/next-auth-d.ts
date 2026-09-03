import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    access_token: string;
    id_token: string;
    error: string;
    roles: string[];
    user: {
      /** Oauth access token */
      access_token?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /**
   * The shape of the token returned by the `jwt` callback in
   * app/api/auth/[...nextauth]/options.ts.
   *
   * `error` is declared here because that callback both writes it (on a failed
   * refresh) and reads it (to avoid retrying a refresh that has already failed).
   * JWT extends Record<string, unknown>, so this compiled without the declaration -
   * but the read was typed `unknown`, which is exactly the sort of thing that
   * silently stops meaning what you think it means.
   */
  interface JWT {
    error?: string;
  }
}
