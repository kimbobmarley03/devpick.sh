import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

function ipToNum(ip: string): number {
  const parts = ip.split(".").map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function numToIp(num: number): string {
  return [(num >>> 24) & 0xff, (num >>> 16) & 0xff, (num >>> 8) & 0xff, num & 0xff].join(".");
}

function numToBin(num: number): string {
  const bin = (num >>> 0).toString(2).padStart(32, "0");
  return [bin.slice(0, 8), bin.slice(8, 16), bin.slice(16, 24), bin.slice(24)].join(".");
}

function getIpClass(firstOctet: number): string {
  if (firstOctet < 128) return "A";
  if (firstOctet < 192) return "B";
  if (firstOctet < 224) return "C";
  if (firstOctet < 240) return "D (Multicast)";
  return "E (Reserved)";
}

function checkPrivate(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

function calculateSubnet(ip: string, cidr: number) {
  const maskNum = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const ipNum = ipToNum(ip);
  const networkNum = (ipNum & maskNum) >>> 0;
  const broadcastNum = (networkNum | (~maskNum >>> 0)) >>> 0;
  const totalHosts = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? totalHosts : Math.max(0, totalHosts - 2);

  return {
    ip,
    cidr,
    network_address: numToIp(networkNum),
    broadcast_address: numToIp(broadcastNum),
    first_host: cidr < 31 ? numToIp(networkNum + 1) : numToIp(networkNum),
    last_host: cidr < 31 ? numToIp(broadcastNum - 1) : numToIp(broadcastNum),
    subnet_mask: numToIp(maskNum),
    wildcard_mask: numToIp(~maskNum >>> 0),
    total_hosts: totalHosts,
    usable_hosts: usableHosts,
    ip_class: getIpClass(parseInt(ip.split(".")[0])),
    is_private: checkPrivate(ip),
    ip_binary: numToBin(ipNum),
    mask_binary: numToBin(maskNum),
    network_binary: numToBin(networkNum),
    broadcast_binary: numToBin(broadcastNum),
  };
}

export function register(server: McpServer) {
  server.tool(
    "calculate_subnet",
    "Calculate subnet details from IP address and CIDR notation (network, broadcast, host range, mask, etc.)",
    {
      cidr: z.string().describe("IP address with CIDR notation (e.g. '192.168.1.0/24') or just IP"),
      prefix: z.number().min(0).max(32).optional().describe("CIDR prefix length if not included in cidr parameter"),
    },
    async ({ cidr, prefix }) => {
      try {
        let ip: string, prefixLen: number;
        if (cidr.includes("/")) {
          const parts = cidr.split("/");
          ip = parts[0].trim();
          prefixLen = parseInt(parts[1]);
        } else {
          ip = cidr.trim();
          prefixLen = prefix ?? 24;
        }
        if (!ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
          return {
            content: [{ type: "text", text: `Error: Invalid IP address: ${ip}` }],
            isError: true,
          };
        }
        const result = calculateSubnet(ip, prefixLen);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e) {
        return {
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "Calculation failed"}` }],
          isError: true,
        };
      }
    }
  );
}
