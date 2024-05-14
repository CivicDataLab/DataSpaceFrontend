# Data Exchange Frontend

A platform to speed up the development of Open Data Exchange.

## Getting Started

To get started, you can clone the repository and run it locally using the following steps:

1. Clone the repository:

```bash
git clone https://github.com/CivicDataLab/data-exchange.git
```

2. Install dependencies

```bash
cd data-exchange

npm i
```

3. Create '.env.local' file in the project folder with the following:

```
KEYCLOAK_CLIENT_ID='opub-dataex'
KEYCLOAK_CLIENT_SECRET='xqZ9PZqnRsIn95dd4B2OpznGOWXVwpKv'
AUTH_ISSUER=https://opub-kc.civicdatalab.in/auth/realms/dataexchange
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET='xqZ9PZqnRsIn95dd4B2OpznGOWXVwpKv'
END_SESSION_URL=https://opub-kc.civicdatalab.in/auth/realms/dataexchange/protocol/openid-connect/logout
REFRESH_TOKEN_URL=https://opub-kc.civicdatalab.in/auth/realms/dataexchange/protocol/openid-connect/token
NEXT_PUBLIC_BACKEND_URL='https://api.datakeep.civicdays.in/api/graphql'
BACKEND_GRAPHQL_URL= 'https://api.datakeep.civicdays.in/api/graphql'
NEXT_PUBLIC_BACKEND_GRAPHQL_URL= 'https://api.datakeep.civicdays.in/api/graphql'
NEXT_PUBLIC_BACKEND_URL= 'https://api.datakeep.civicdays.in'
```

4. Start the development server:

```bash
npm run dev
```

## Documentation

Data Exchange uses Next.js new `app` directory. For more information on how to use Next.js, refer to the [Next.js documentation](https://beta.nextjs.org/docs/getting-started).

## Community

We use Github Discussions to discuss ideas, proposals and questions about the project. You can [head over there](https://github.com/CivicDataLab/data-exchange/discussions) to interact with the community.

Our [Code of Conduct](CODE_OF_CONDUCT.md) applies to all community channels.

## Contributing

Contributions to the project are welcome! To contribute, simply fork the repository, make your changes, and submit a pull request.

For more information on contributing to the project, refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## License

This project is licensed under the MIT license. For more information, refer to the [LICENSE](LICENSE) file.

## Security

If you believe you have found a security vulnerability in Data Exchange, we encourage you to responsibly disclose this and not open a public issue. We will investigate all legitimate reports. Email `tech@civicdatalab.in` to disclose any security vulnerabilities.
