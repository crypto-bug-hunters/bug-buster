import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const client = new ApolloClient({
    uri: "http://localhost:8080/graphql",
    cache: new InMemoryCache(),
});

const GraphQLProvider = ({ children }: { children: React.ReactNode }) => {
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default GraphQLProvider;
