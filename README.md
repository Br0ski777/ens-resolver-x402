# ENS Resolver API

[![MCP Server](https://img.shields.io/badge/MCP-server-blue)](https://ens-resolver.api.klymax402.com/mcp)
[![x402](https://img.shields.io/badge/payments-x402-6E56CF)](https://x402.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Resolve ENS names to ETH addresses and reverse -- avatar URLs included. Identity layer for agents. Pay-per-call via [x402](https://x402.org) (USDC on Base L2) -- no API key, no signup, no rate-limit wall.

Part of the [klymax402](https://klymax402.com) marketplace -- 100 x402 micropayment APIs for AI agents, one wallet, USDC on Base.

## Quickstart -- MCP

Add to your MCP client config (Claude Desktop, Cursor, ElizaOS, etc.):

```json
{
  "mcpServers": {
    "ens-resolver": {
      "url": "https://ens-resolver.api.klymax402.com/mcp"
    }
  }
}
```

## Quickstart -- HTTP (x402)

```bash
curl -X POST "https://ens-resolver.api.klymax402.com/api/resolve" \
  -H "Content-Type: application/json" \
  -d '{}'
# -> 402 Payment Required, with an x402 payment challenge in the response body
```

Any x402-aware client ([`@x402/fetch`](https://www.npmjs.com/package/@x402/fetch), [`x402-agent-tools`](https://www.npmjs.com/package/x402-agent-tools), ATXP) handles the 402 -> sign -> retry cycle automatically.

## Tools

| Tool | Method | Path | Price | Description |
|---|---|---|---|---|
| `crypto_resolve_ens` | POST | `/api/resolve` | $0.005 | Resolve ENS name to Ethereum address or reverse-resolve address to ENS name |

### `crypto_resolve_ens`

Use this when you need to resolve an ENS name to an Ethereum address, or reverse-resolve an address to its ENS name. Returns resolution data in JSON.

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `name` | string | no | ENS name to resolve (e.g. vitalik.eth) |
| `address` | string | no | Ethereum address for reverse resolution (e.g. 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045) |

**Returns**

- `address` -- resolved Ethereum address (0x...)
- `ensName` -- ENS name (e.g. vitalik.eth)
- `avatar` -- avatar URL associated with the ENS name (if set)
- `resolvedDirection` -- "forward" (name to address) or "reverse" (address to name)

Example response:

```json
{"address":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045","ensName":"vitalik.eth","avatar":"https://...","resolvedDirection":"forward"}
```

**When to use**: sending funds to an ENS name to verify the correct address. Essential for identity resolution and human-readable wallet lookup.

**Not for**: wallet balances (use `wallet_get_portfolio`), token safety (use `token_check_safety`), NFT metadata (use `crypto_get_nft_metadata`).

## Example agent prompts

- "Resolve an ENS name to an Ethereum address, or reverse-resolve an address to its ENS name"

## Payment

- Protocol: [x402](https://x402.org) -- HTTP-native pay-per-call, no signup, no API key
- Network: Base L2 (`eip155:8453`)
- Asset: USDC
- Facilitator: Coinbase CDP (primary), PayAI (fallback)
- Also reachable via [ATXP](https://atxp.ai) (OAuth-wrapped x402, RFC 9728 protected-resource metadata)

## Part of klymax402

100 x402 micropayment APIs for AI agents -- one wallet, USDC on Base, zero signup.

- Catalog: https://klymax402.com/llms.txt
- Full API reference: https://klymax402.com/llms-full.txt
- Live stats: https://klymax402.com/stats

## License

MIT
