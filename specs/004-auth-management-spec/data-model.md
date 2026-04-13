# Data Model: Authentication Management

## User

### Purpose
Represents a person account that can authenticate and access private finance data.

### Fields
- id: string - Unique user identity.
- name: string - Full name entered during registration.
- email: string - Normalized unique email used for login.
- passwordHash: string - Stored password hash derived from registration password.
- createdAt: datetime - Account creation timestamp.
- updatedAt: datetime - Most recent account update timestamp.

### Constraints
- `name` is required and must satisfy minimum display-name rules.
- `email` is required, must be valid format, and must be unique after normalization.
- `passwordHash` must only be created from passwords passing secure composition rules.

### Relationships
- One-to-one with user settings profile.
- One-to-many with domain entities owned by the user (accounts, transactions, plans).

### Lifecycle (optional)
- registration pending -> active account
- active account -> authenticated session owner

## AuthSession

### Purpose
Represents active signed-in state that authorizes access to protected routes.

### Fields
- subjectUserId: string - User identity bound to the session.
- email: string - Email claim associated with current session identity.
- issuedAt: datetime - Session issue time.
- expiresAt: datetime - Session expiration time.
- remember: boolean - Indicates extended session duration preference.

### Constraints
- Must map to an existing active user.
- Must be rejected when expired or invalid.
- Must be stored/transmitted only through secure cookie session channel.

### Relationships
- Many sessions over time can belong to one user.

### Lifecycle (optional)
- created at successful login/register -> active
- active -> expired
- active -> cleared on logout

## AuthAttempt

### Purpose
Tracks login/register attempt throttling context for abuse mitigation and user feedback.

### Fields
- key: string - Attempt bucket identity derived from route and user context.
- flow: enum(login, register) - Auth flow where attempt occurred.
- emailHint: string nullable - Normalized email context when provided.
- retryAfterMs: number - Remaining wait period when throttled.
- failureCount: number - Current failure streak in backoff window.

### Constraints
- Backoff applies independently for login and registration flows.
- Successful authentication clears backoff state for that flow key.

### Relationships
- Logical association to user identity by normalized email when available.
