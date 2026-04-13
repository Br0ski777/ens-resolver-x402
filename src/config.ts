import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "ens-resolver",
  slug: "ens-resolver",
  description: "Resolve ENS names to Ethereum addresses and reverse. Avatar support.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/resolve",
      price: "$0.002",
      description: "Resolve ENS name to Ethereum address or reverse-resolve address to ENS name",
      toolName: "crypto_resolve_ens",
      toolDescription: "Use this when you need to resolve an ENS name (e.g. vitalik.eth) to an Ethereum address, or reverse-resolve an Ethereum address to its ENS name. Returns the resolved address, ENS name, and avatar URL when available. Supports forward resolution (name to address) and reverse resolution (address to name). Do NOT use for wallet balances — use crypto_get_wallet_portfolio instead. Do NOT use for token safety — use crypto_check_token_safety instead.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "ENS name to resolve (e.g. vitalik.eth)" },
          address: { type: "string", description: "Ethereum address for reverse resolution (e.g. 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045)" },
        },
        required: [],
      },
    },
  ],
};
