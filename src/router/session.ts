import { API_BASE_URL } from "@/services/api";

// Why these vars live outside functions? Because these variables live at the file level (module scope),
//they persist in the browser's memory for as long as the user's tab is open.
// Cache-like stored info, needs to verify with JWT to ensure consistent auth/new login-auth
let verifiedToken:string | null = null;
let sessionIsValid:boolean = false;

// clear cache,ex: when user logs-out
export function clearVerifiedSession(){
  verifiedToken = null;
  sessionIsValid = false;
}

export async function verifySession(token:string):Promise<boolean>{

//When user logged in alr and tried to navigate in UI. dont bother server, return the cached sessionIsValid state.
  if (token === verifiedToken) return sessionIsValid;

// New login/new token:
  verifiedToken = token; // Updated cached token stored
  sessionIsValid = false; // Keep state false until server fetch proves otherwise.(see Below)

try{
  const response = await fetch(`${API_BASE_URL}/auth/me`,{
    headers:{Authorization:`Bearer ${token}`} //space necessary post Bearer
  })

  if(!response.ok) return false;

  sessionIsValid = true;
  return true;
}
catch{
  return false; //Safety fallback
}
}
