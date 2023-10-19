import hardhatDeploy from "@sunodo/wagmi-plugin-hardhat-deploy";
import { defineConfig } from "@wagmi/cli";
import { erc, react } from "@wagmi/cli/plugins";

export default defineConfig({
    out: "src/hooks/contracts.tsx",
    plugins: [
        hardhatDeploy({
            directory: "node_modules/@cartesi/rollups/export/abi",
        }),
        erc(),
        react(),
    ],
});
