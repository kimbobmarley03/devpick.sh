import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const LOREM_WORDS = [
  "lorem","ipsum","dolor","sit","amet","consectetur","adipiscing","elit",
  "sed","do","eiusmod","tempor","incididunt","ut","labore","et","dolore",
  "magna","aliqua","enim","ad","minim","veniam","quis","nostrud","exercitation",
  "ullamco","laboris","nisi","aliquip","ex","ea","commodo","consequat","duis",
  "aute","irure","in","reprehenderit","voluptate","velit","esse","cillum",
  "fugiat","nulla","pariatur","excepteur","sint","occaecat","cupidatat","non",
  "proident","sunt","culpa","qui","officia","deserunt","mollit","anim","id","est",
  "laborum","perspiciatis","unde","omnis","iste","natus","error","accusantium",
  "doloremque","laudantium","totam","rem","aperiam","eaque","ipsa","quae","ab",
  "inventore","veritatis","architecto","beatae","vitae","dicta","explicabo",
  "nemo","ipsam","voluptatem","quia","voluptas","aspernatur","aut","odit","fugit",
];

const CLASSIC_OPENING =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomWord(): string {
  return LOREM_WORDS[randInt(0, LOREM_WORDS.length - 1)];
}

function generateSentence(): string {
  const wordCount = randInt(8, 20);
  const words = Array.from({ length: wordCount }, (_, i) => {
    const w = randomWord();
    return i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w;
  });
  return words.join(" ") + ".";
}

function generateParagraph(classic: boolean, index: number): string {
  const sentenceCount = randInt(4, 8);
  const sentences = Array.from({ length: sentenceCount }, (_, i) => {
    if (classic && index === 0 && i === 0) return CLASSIC_OPENING;
    return generateSentence();
  });
  return sentences.join(" ");
}

function generate(unit: "paragraphs" | "sentences" | "words", count: number, classic: boolean): string {
  const n = Math.max(1, Math.min(count, unit === "paragraphs" ? 20 : unit === "sentences" ? 100 : 500));
  if (unit === "paragraphs") {
    return Array.from({ length: n }, (_, i) => generateParagraph(classic, i)).join("\n\n");
  }
  if (unit === "sentences") {
    return Array.from({ length: n }, (_, i) => {
      if (classic && i === 0) return CLASSIC_OPENING;
      return generateSentence();
    }).join(" ");
  }
  // words
  return Array.from({ length: n }, (_, i) => {
    if (classic && i === 0) return "Lorem";
    if (classic && i === 1) return "ipsum";
    return randomWord();
  }).join(" ");
}

export function register(server: McpServer) {
  server.tool(
    "generate_lorem_ipsum",
    "Generate Lorem Ipsum placeholder text",
    {
      unit: z.enum(["paragraphs", "sentences", "words"]).optional().default("paragraphs").describe("Unit of generation"),
      count: z.number().min(1).optional().default(3).describe("Number of units to generate"),
      classic: z.boolean().optional().default(true).describe("Start with the classic 'Lorem ipsum' opening"),
    },
    async ({ unit, count, classic }) => {
      const output = generate(unit ?? "paragraphs", count ?? 3, classic ?? true);
      return { content: [{ type: "text", text: output }] };
    }
  );
}
