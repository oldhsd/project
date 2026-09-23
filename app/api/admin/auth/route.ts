import { json } from '@/lib/http';
// Intentionally retired: no demo cookies, shared passcodes, public admin signup or default credentials.
export async function POST() {
  return json(
    {
      error:
        'Use the standard sign-in page. Administrator accounts must be provisioned by an operator.',
    },
    410
  );
}
