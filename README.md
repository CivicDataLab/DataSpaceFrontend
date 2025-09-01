# Data Exchange Frontend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.0+-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Issues](https://img.shields.io/github/issues/CivicDataLab/DataSpaceFrontend)](https://github.com/CivicDataLab/DataSpaceFrontend/issues)
[![Contributors](https://img.shields.io/github/contributors/CivicDataLab/DataSpaceFrontend)](https://github.com/CivicDataLab/DataSpaceFrontend/graphs/contributors)

A platform to speed up the development of Open Data Exchange.

## Getting Started

To get started, you can clone the repository and run it locally using the following steps:

1. Clone the repository:

```bash
git clone https://github.com/CivicDataLab/DataSpaceFrontend.git
```

2. Install dependencies

```bash
cd DataSpaceFrontend

npm i
```

3. Create '.env.local' file in the project folder with the following:

```
KEYCLOAK_CLIENT_ID
KEYCLOAK_CLIENT_SECRET
AUTH_ISSUER
NEXTAUTH_URL
NEXTAUTH_SECRET
END_SESSION_URL
REFRESH_TOKEN_URL
NEXT_PUBLIC_BACKEND_URL
BACKEND_GRAPHQL_URL
NEXT_PUBLIC_BACKEND_GRAPHQL_URL
NEXT_PUBLIC_BACKEND_URL
```

4. Start the development server:

```bash
npm run dev
```

## Documentation

Data Exchange uses Next.js new `app` directory. For more information on how to use Next.js, refer to the [Next.js documentation](https://beta.nextjs.org/docs/getting-started).

## Community

We use Github Discussions to discuss ideas, proposals and questions about the project. You can [head over there](https://github.com/CivicDataLab/DataSpaceFrontend/discussions) to interact with the community.

Our [Code of Conduct](CODE_OF_CONDUCT.md) applies to all community channels.

## Contributing

Contributions to the project are welcome! To contribute, simply fork the repository, make your changes, and submit a pull request.

For more information on contributing to the project, refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## License

This project is licensed under the MIT license. For more information, refer to the [LICENSE](LICENSE) file.

## Security

If you believe you have found a security vulnerability in Data Exchange, we encourage you to responsibly disclose this and not open a public issue. We will investigate all legitimate reports. Email `tech@civicdatalab.in` to disclose any security vulnerabilities.
