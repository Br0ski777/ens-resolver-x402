import type { ApiConfig } from "./shared";

export const API_CONFIG: ApiConfig = {
  name: "ens-resolver",
  slug: "ens-resolver",
  description: "Resolve ENS names to ETH addresses and reverse -- avatar URLs included. Identity layer for agents.",
  version: "1.0.0",
  routes: [
    {
      method: "POST",
      path: "/api/resolve",
      price: "$0.002",
      description: "Resolve ENS name to Ethereum address or reverse-resolve address to ENS name",
      toolName: "crypto_resolve_ens",
      toolDescription: `Use this when you need to resolve an ENS name to an Ethereum address, or reverse-resolve an address to its ENS name. Returns resolution data in JSON.

1. address: resolved Ethereum address (0x...)
2. ensName: ENS name (e.g. vitalik.eth)
3. avatar: avatar URL associated with the ENS name (if set)
4. resolvedDirection: "forward" (name to address) or "reverse" (address to name)

Example output: {"address":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045","ensName":"vitalik.eth","avatar":"https://...","resolvedDirection":"forward"}

Use this BEFORE sending funds to an ENS name to verify the correct address. Essential for identity resolution and human-readable wallet lookup.

Do NOT use for wallet balances -- use wallet_get_portfolio instead. Do NOT use for token safety -- use token_check_safety instead. Do NOT use for NFT metadata -- use crypto_get_nft_metadata instead.`,
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "ENS name to resolve (e.g. vitalik.eth)" },
          address: { type: "string", description: "Ethereum address for reverse resolution (e.g. 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045)" },
        },
        required: [],
      },
      outputSchema: {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "ENS name"
            },
            "address": {
              "type": "string",
              "description": "Resolved Ethereum address"
            },
            "avatar": {
              "type": "string",
              "description": "Avatar URL"
            },
            "direction": {
              "type": "string",
              "description": "Resolution direction (forward or reverse)"
            },
            "timestamp": {
              "type": "string",
              "description": "ISO 8601 timestamp"
            }
          },
          "required": [
            "direction"
          ]
        },
    },
  ],
};
