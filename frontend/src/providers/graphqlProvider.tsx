import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL;
if (GRAPHQL_URL === undefined || GRAPHQL_URL == "")
    throw new Error("A GraphQL endpoint is required");

const client = new ApolloClient({
    uri: GRAPHQL_URL,
    cache: new InMemoryCache(),
});

const GraphQLProvider = ({ children }: { children: React.ReactNode }) => {
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default GraphQLProvider;
