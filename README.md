# NeuralLog Web

The web interface for the NeuralLog zero-knowledge logging system. This Next.js application provides a user-friendly interface for viewing and managing logs while maintaining the zero-knowledge architecture.

## Overview

NeuralLog Web is a Next.js application that serves as the frontend for the NeuralLog system. It provides a user interface for:

- Viewing and searching logs
- Managing API keys
- Configuring Key Encryption Keys (KEKs)
- User management and authentication

All cryptographic operations happen client-side, ensuring that sensitive data never leaves the user's browser.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Features

- **Zero-Knowledge Architecture**: All encryption/decryption happens client-side
- **Secure Logging**: End-to-end encrypted logs
- **Encrypted Log Names**: Log names are encrypted before being sent to the server
- **API Key Management**: Create and manage API keys
- **Key Encryption Key (KEK) Management**: Secure key management with KEKs
- **User Management**: Add, remove, and update users
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Support for light and dark themes

## Documentation

Detailed documentation is available in the [docs](./docs) directory:

- [API Reference](./docs/api.md)
- [Configuration](./docs/configuration.md)
- [Architecture](./docs/architecture.md)
- [Examples](./docs/examples)

For integration guides and tutorials, visit the [NeuralLog Documentation Site](https://neurallog.github.io/docs/).

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Related NeuralLog Components

- [NeuralLog Auth](https://github.com/NeuralLog/auth) - Authentication and authorization
- [NeuralLog Server](https://github.com/NeuralLog/server) - Core server functionality
- [NeuralLog TypeScript Client SDK](https://github.com/NeuralLog/typescript-client-sdk) - TypeScript client SDK

## License

MIT
