//nest api url
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000')
.replace(/\/$/,'',)   //replace forward slash, if any, with empty string.

export const AUTH_TOKEN_STORAGE_KEY = 'access_token'//Vue Code uses the caps-var everywhere, access_token property
                                                    //comes from response of NestJS auth/login route

//Exception/HttpException/custom exception filters belomg to nestjs, most fleixible option here is using Error class,
// extending it by passing status as well, as it ony has a message
export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
// RequestInit is a built-in JS/TS type that represents all the standard options you can pass into a fetch() request (like method,
//headers, body, mode, credentials, etc.).
// We created a type using & and a boolean value var

// & (Intersection Operator): Used strictly in TypeScript types. It means "Combine these two types together into a single merged type."
//Meaning,merging the type that contains possible options for fetch() and the boleean type.
//Couldn't have used && or | (union, as that'd mean is either of options or boolean value)
type ApiOptions = RequestInit & { skipAuth?: boolean }


export async function apiRequest<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
//headers: suppliedHeaders -- Extracts the headers property from options and renames it locally to suppliedHeaders so it doesn't conflict with anything else.
  const { skipAuth = false, headers: suppliedHeaders, ...requestOptions } = options
  const headers = new Headers(suppliedHeaders)//make sit easy to wrok with& use header methods like headers.has(), headers.set(), and headers.append().
  const hasBody = requestOptions.body !== undefined && requestOptions.body !== null

//If in header, a 'Content-Type':value is passed already, dont manually apply this
  if (hasBody && !(requestOptions.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = skipAuth ? null : localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  if (token) headers.set('Authorization', `Bearer ${token}`)


  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...requestOptions, headers })
  } catch {
    throw new ApiError('Unable to reach the API. Check that the backend is running.', 0)
  }

//Check if the server said 'No Content' (204). If yes, set result to null. If no, try your best to parse the incoming response as
//  JSON—and if the JSON parsing fails or blows up, fallback safely to null.
//response.json() on NON-JSON data  throws error & crashes app, so .catch() is a ssafety fallback
  const result = response.status === 204 ? null : await response.json().catch(() => null)

//Now, result is the ref var that contains the response object.

// Handle 401 Unauthorized globally:
  // - Allowed/Permitted: /auth/login & /auth/bootstrap-admin are initial routes where a token
  //   isn't expected yet (invalid credentials shouldn't trigger a forced logout).

  // - Restricted: All other routes require a valid token. A 401 here means the session
  //   or JWT has expired, so we clear local storage and broadcast an expiry event to
  //   force the user back to the login page.
  if (
    response.status === 401 &&
    !path.startsWith('/auth/login') &&
    !path.startsWith('/auth/bootstrap-admin')
  ) {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    window.dispatchEvent(new Event('auth:expired'))
  }

// Handle non-success responses (!response.ok / outside 2xx range):
  // - Message Extraction: NestJS validation pipes often return error messages as an array
  //   of strings (e.g. DTO validation errors). We check if `result.message` is an array and
  //   use `.join(', ')` to merge them into a single string. Otherwise, we fallback to a
  //   single string message or a generic HTTP status failure message.
  // - Error Throwing: We throw a custom `ApiError` carrying both the normalized message
  //   and the exact HTTP status code so Vue components can handle it cleanly.
  // - Successful Return: If response.ok is true, we return the parsed `result` casted
  //   directly to the generic return type `T`.
  
                             //fetching message from respinse body
  if (!response.ok) {                  //message in response_object in NestJS  --result below is response_object
    const message = Array.isArray((result as { message?: unknown[] } | null)?.message)//checking if message in response object is an array
      ? (result as { message: unknown[] }).message.join(', ')//response_object.message.join(',')  .join(',') brings together elements of an array as a siingle string, seperated by commas.
      : (result as { message?: string } | null)?.message ||
        `Request failed with status ${response.status}`
    throw new ApiError(message, response.status)
  }

  return result as T
}



// The Real-World Equivalent
// Imagine you wrote this call in your Vue component to update a user's profile:

// await apiRequest('/users/profile', {
//   method: 'PATCH',
//   headers: {
//     'X-Custom-Tracking-ID': 'abc-123'
//   },
//   body: JSON.stringify({ fullName: 'Alwin Mathew' })
// })


// What fetch actually executes:
// When that line of code runs, it is equivalent to the browser running this native JavaScript command:
// Post the URL, every header:value is within {}, wherein each header's value is in quotes.

// response = await fetch('http://localhost:3000/users/profile', {
//   method: 'PATCH',
//   headers: {
//     'x-custom-tracking-id': 'abc-123',
//     'content-type': 'application/json',
//     'authorization': 'Bearer eyJhbGciOi...'
//   },
//   body: '{"fullName":"Alwin Mathew"}'
// })


// Here is a complete, clean, and copy-pasteable summary of everything we covered and mastered together during our deep dive into the Vue/NestJS `apiRequest` utility:

// ### API Client Utility (`apiRequest.ts`) — Comprehensive Summary

// #### 1. Core Purpose & Architecture

// * **Universal Messenger:** Acts as a centralized wrapper around the browser's native `fetch` API, eliminating repetitive code across Vue components.
// * **Security & Routing Guard:** Automatically injects authentication tokens, manages headers, normalizes heterogeneous NestJS error responses, and handles token expiration states globally.

// #### 2. Environment Setup & Constants

// * **Base URL Resolution:** Combines `import.meta.env.VITE_BASE_URL` with a fallback (`http://localhost:3000`) and uses `.replace(/\/$/, '')` to safely trim trailing slashes.
// * **Magic String Prevention:** Stores authentication keys in a constant variable (`AUTH_TOKEN_STORAGE_KEY = 'access_token'`) to prevent typos across files.

// #### 3. Request Configuration & Headers

// * **`ApiOptions` Intersection:** Extends native `RequestInit` with a custom `{ skipAuth?: boolean }` flag to bypass authentication on public endpoints.
// * **Smart Content Types:** Automatically appends `'Content-Type': 'application/json'` when a valid request body is present (excluding `FormData`).
// * **Bearer Token Injection:** Securely reads the stored token from `localStorage` and appends it to headers as `Authorization: Bearer <token>`.

// #### 4. Error Handling & Custom Classes

// * **`ApiError` Class:** Extends the native JavaScript `Error` class, adding a custom `status` property to capture HTTP error codes (e.g., 400, 401, 500) alongside descriptive messages.
// * **Network Fallbacks:** Wraps `fetch` in a `try...catch` block to gracefully capture dropped connections and throw a clean `ApiError` with a status of `0`.

// #### 5. Response Lifecycle & The 204 Edge Case

// * **Handling No Content:** Checks for `response.status === 204` to return `null` safely, preventing browser parsing crashes on empty payloads.
// * **JSON Parsing Safety:** Uses `await response.json().catch(() => null)` to handle successful payloads while providing a backup if malformed data returns.

// #### 6. Advanced TypeScript & Error-Parsing Logic

// * **Type Assertions vs. Unions:** Mastered the difference between type casting (`as`) and type unions (`| null`), using `unknown` to resolve TypeScript compilation blocks.
// * **Optional Chaining (`?.`):** Safeguarded properties against runtime crashes when properties or objects evaluate to `null` or `undefined`.
// * **Multi-Tier Ternary Chains (`? :`):** Built a smart 3-tier fallback parser for NestJS error payloads:
// 1. **Tier 1:** Checks `Array.isArray()` and joins multiple validation errors into a single sentence using `.join(', ')`.
// 2. **Tier 2:** Checks for a single string error message.
// 3. **Tier 3:** Falls back to a default message using the HTTP status code via a logical OR (`||`) operator.



// #### 7. Session Expiration & Route Protection

// * **401 Interception:** Detects `401 Unauthorized` responses to automatically clear dead tokens from `localStorage`.
// * **Route Exclusions:** Used negated string checks (`!path.startsWith(...)`) to protect public routes like `/auth/login` and `/auth/bootstrap-admin` from triggering accidental session-expiration logouts.
// * **Event Dispatching:** Broadcasts a custom browser event (`window.dispatchEvent(new Event('auth-expired'))`) to notify the Vue application to redirect users back to the login screen.
