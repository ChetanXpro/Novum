# @novum/shared

This package contains shared types, utilities, and constants used across the Novum video sharing platform.

## Usage

This package is used internally by the frontend and backend packages of the Novum project. It's not intended to be published or used externally.

To use types or utilities from this package in other packages of the Novum project, import them like this:

```typescript
import { SomeType, someUtility } from '@novum/shared';
```

## Development

To build this package:

```
npm run build
```

This will compile the TypeScript files and generate type definitions.

Note: There's no need to run this command directly as it's included in the root-level build process.