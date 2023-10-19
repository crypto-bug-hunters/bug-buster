import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "src/model/schema.graphql",
    documents: ["src/**/*.{ts,tsx}"],
    generates: {
        "src/model/__generated__/": {
            preset: "client",
            plugins: [],
            presetConfig: {
                gqlTagName: "gql",
            },
        },
    },
    ignoreNoDocuments: true,
};

export default config;
