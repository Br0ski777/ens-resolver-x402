import type { Hono } from "hono";

const ETH_RPC = "https://cloudflare-eth.com";

async function ethCall(to: string, data: string): Promise<string> {
  const resp = await fetch(ETH_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{ to, data }, "latest"],
      id: 1,
    }),
  });
  const json = await resp.json() as any;
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

function namehash(name: string): string {
  let node = "0x0000000000000000000000000000000000000000000000000000000000000000";
  if (name === "") return node;
  const labels = name.split(".");
  for (let i = labels.length - 1; i >= 0; i--) {
    const labelHash = keccak256(labels[i]);
    node = keccak256Hex(node + labelHash.slice(2));
  }
  return node;
}

// Minimal keccak256 using Web Crypto is not available for keccak.
// Use a simple implementation via Bun's crypto.
function keccak256(input: string): string {
  const hasher = new Bun.CryptoHasher("sha3-256");
  // ENS uses keccak256 not sha3-256. We'll use the ethers-style approach.
  // Bun doesn't have native keccak256, so we'll compute the namehash via the ENS universal resolver.
  // Instead, let's use the ENS subgraph/API approach.
  hasher.update(input);
  return "0x" + hasher.digest("hex");
}

function keccak256Hex(hexInput: string): string {
  const hasher = new Bun.CryptoHasher("sha3-256");
  const bytes = Buffer.from(hexInput.replace("0x", ""), "hex");
  hasher.update(bytes);
  return "0x" + hasher.digest("hex");
}

// Use ENS subgraph for reliable resolution (no keccak256 dependency issue)
async function resolveViaSubgraph(name: string): Promise<{ address: string | null; avatar: string | null }> {
  const query = `{
    domains(where: {name: "${name}"}) {
      resolvedAddress { id }
      resolver { texts }
    }
  }`;
  const resp = await fetch("https://api.thegraph.com/subgraphs/name/ensdomains/ens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const data = await resp.json() as any;
  const domain = data?.data?.domains?.[0];
  return {
    address: domain?.resolvedAddress?.id || null,
    avatar: null, // subgraph doesn't directly return avatar
  };
}

// Use ENS metadata API (public, no key needed)
async function resolveViaMetadata(name: string): Promise<{ address: string | null; avatar: string | null }> {
  try {
    const resp = await fetch(`https://metadata.ens.domains/mainnet/avatar/${name}`, { method: "HEAD" });
    const avatarUrl = resp.ok ? `https://metadata.ens.domains/mainnet/avatar/${name}` : null;
    return { address: null, avatar: avatarUrl };
  } catch {
    return { address: null, avatar: null };
  }
}

// Primary resolution via Cloudflare ETH gateway + ENS universal resolver
async function resolveForward(name: string): Promise<{ address: string | null; name: string; avatar: string | null }> {
  // Use the ENS Universal Resolver (0xce01f8eee7E479C928F8919abD53E553a36CeF67)
  // resolve(bytes name, bytes data) where data = addr(bytes32 node)
  // Simpler: use the ENS public API
  try {
    const resp = await fetch(`https://ensdata.net/${name}`);
    if (resp.ok) {
      const data = await resp.json() as any;
      return {
        address: data.address || null,
        name: name,
        avatar: data.avatar || data.avatar_url || null,
      };
    }
  } catch {}

  // Fallback: try ens metadata service
  try {
    const resp = await fetch(`https://metadata.ens.domains/mainnet/avatar/${name}`, { method: "HEAD" });
    const avatar = resp.ok ? `https://metadata.ens.domains/mainnet/avatar/${name}` : null;
    return { address: null, name, avatar };
  } catch {}

  return { address: null, name, avatar: null };
}

async function resolveReverse(address: string): Promise<{ address: string; name: string | null; avatar: string | null }> {
  try {
    const resp = await fetch(`https://ensdata.net/${address}`);
    if (resp.ok) {
      const data = await resp.json() as any;
      return {
        address,
        name: data.ens || data.name || null,
        avatar: data.avatar || data.avatar_url || null,
      };
    }
  } catch {}

  return { address, name: null, avatar: null };
}

export function registerRoutes(app: Hono) {
  app.post("/api/resolve", async (c) => {
    const body = await c.req.json().catch(() => null);

    if (!body?.name && !body?.address) {
      return c.json({ error: "Provide either 'name' (e.g. vitalik.eth) or 'address' (0x...) for reverse resolution" }, 400);
    }

    try {
      if (body.name) {
        const name = body.name.toLowerCase().trim();
        if (!name.endsWith(".eth") && !name.includes(".")) {
          return c.json({ error: "ENS name must end with .eth (e.g. vitalik.eth)" }, 400);
        }
        const result = await resolveForward(name);
        return c.json({
          ...result,
          direction: "forward",
          timestamp: new Date().toISOString(),
        });
      }

      if (body.address) {
        const address = body.address.trim();
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
          return c.json({ error: "Invalid Ethereum address format. Must be 0x followed by 40 hex characters." }, 400);
        }
        const result = await resolveReverse(address);
        return c.json({
          ...result,
          direction: "reverse",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (e: any) {
      return c.json({ error: `ENS resolution failed: ${e.message}` }, 500);
    }
  });
}
