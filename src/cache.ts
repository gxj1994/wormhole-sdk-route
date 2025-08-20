import { fetchTokenList, ChainName } from "@mayanfinance/swap-sdk";
import fs from "node:fs";
import * as path from 'path';
const chains: ChainName[] = [
  "solana",
  "ethereum",
  "bsc",
  "polygon",
  "avalanche",
  "arbitrum",
  "aptos",
  "base",
  "optimism",
  "sui",
];
let tokensCache: Partial<Record<ChainName, any>> = {};

function findProjectRoot(startDir: string = __dirname): string {
  let currentDir = startDir;

  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  // Fallback: use the script directory's parent
  return path.resolve(__dirname, '..');
}

async function cacheTokens() {
  await Promise.all(
    chains.map(async (chain) => {
      return fetchTokenList(chain).then((tokens) => {
        tokensCache[chain] = tokens;
        console.log("fetched", chain);
      });
    })
  ).then(async () => {
    const projectRoot = findProjectRoot();
    const dirPath = path.join(projectRoot, 'cache', 'mayan');
    const filePath = path.join(dirPath, 'tokens.json');

    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      await fs.promises.mkdir(dirPath, { recursive: true });
    }
    fs.writeFile(filePath, JSON.stringify(tokensCache), (err) =>
      console.error(err)
    );
    console.log("cached tokens to cache/mayan/tokens.json");
  });
}


export async function readCacheTokens() {
  const projectRoot = findProjectRoot();
  const filePath = path.join(projectRoot, 'cache', 'mayan', 'tokens.json');
  if (!fs.existsSync(filePath)) {
    await cacheTokens();
  }
  return JSON.parse(
    fs.readFileSync(filePath, { encoding: 'utf-8' })
  );
}