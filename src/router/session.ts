import { API_BASE_URL,} from '../services/api';

let verifiedToken: string | null = null;
let sessionIsValid = false;

export function clearVerifiedSession() {
  verifiedToken = null;
  sessionIsValid = false;
}

export async function verifySession(token: string): Promise<boolean> {
  if (verifiedToken === token) return sessionIsValid;
  verifiedToken = token;
  sessionIsValid = false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return false;
    sessionIsValid = true;
    return true;
  } catch {
    return false;
  }
}
