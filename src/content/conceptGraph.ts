/**
 * content/conceptGraph.ts
 *
 * Static structure of the 23-concept graph (grammar + data_representation),
 * per design doc §8. This is the SAME for every student -- it is not
 * per-session data, so it lives entirely on the frontend and requires no
 * backend endpoint. Per-student coloring is applied separately in
 * ConceptGraph.tsx using the existing `GET /report` response's
 * `concept_scores`.
 *
 * If concepts.csv changes (new concepts, edges), this file needs a manual
 * update to match -- there is no automated sync with the backend's source
 * of truth. Cheap to keep in sync at 23 concepts; revisit if the graph
 * grows enough that this becomes error-prone.
 */

import type { ThemeId } from "../api/themes";

export interface ConceptGraphNode {
  id: string;
  name: string;
  theme: ThemeId;
  prerequisites: string[]; // concept ids
}

export const CONCEPT_GRAPH: ConceptGraphNode[] = [
  // --- grammar (6) ---
  { id: "GR01", name: "Keywords vs Identifiers", theme: "grammar", prerequisites: [] },
  { id: "GR02", name: "Identifier Naming Rules", theme: "grammar", prerequisites: ["GR01"] },
  { id: "GR03", name: "Statements vs Expressions", theme: "grammar", prerequisites: ["GR01"] },
  { id: "GR04", name: "Literals", theme: "grammar", prerequisites: ["GR01"] },
  { id: "GR05", name: "Comments", theme: "grammar", prerequisites: [] },
  { id: "GR06", name: "Punctuators & Delimiters", theme: "grammar", prerequisites: ["GR01"] },

  // --- data_representation (17) ---
  { id: "DT01", name: "Data Type Basics", theme: "data_representation", prerequisites: [] },
  { id: "DT02", name: "Variable Declaration Syntax", theme: "data_representation", prerequisites: ["DT01", "GR02"] },
  { id: "DT03", name: "Variable Initialization", theme: "data_representation", prerequisites: ["DT02"] },
  { id: "DT04", name: "Type Sizes & Range", theme: "data_representation", prerequisites: ["DT01"] },
  { id: "DT05", name: "Implicit Type Conversion", theme: "data_representation", prerequisites: ["DT03", "DT04"] },
  { id: "DT06", name: "Explicit Type Conversion / Casting", theme: "data_representation", prerequisites: ["DT05"] },
  { id: "DT07", name: "const Qualifier", theme: "data_representation", prerequisites: ["DT02", "GR04"] },
  { id: "DT08", name: "Enumerations (enum)", theme: "data_representation", prerequisites: ["DT01"] },
  { id: "DT09", name: "sizeof Operator", theme: "data_representation", prerequisites: ["DT04"] },
  { id: "DT10", name: "Signed vs Unsigned Integers", theme: "data_representation", prerequisites: ["DT04"] },
  { id: "DT11", name: "Boolean-like Representation in C", theme: "data_representation", prerequisites: ["DT01"] },
  { id: "DT12", name: "Integer Type Modifiers (short/long)", theme: "data_representation", prerequisites: ["DT01"] },
  { id: "DT13", name: "Floating-Point Types & Precision", theme: "data_representation", prerequisites: ["DT01"] },
  { id: "DT14", name: "Character Representation & ASCII", theme: "data_representation", prerequisites: ["DT01", "GR04"] },
  { id: "DT15", name: "Two's Complement Representation", theme: "data_representation", prerequisites: ["DT10"] },
  { id: "DT16", name: "volatile Qualifier", theme: "data_representation", prerequisites: ["DT07"] },
  { id: "DT17", name: "Mixed-Type Arithmetic & Precision Loss", theme: "data_representation", prerequisites: ["DT05"] },
];

/**
 * Depth = number of prerequisite hops from a no-prerequisite concept.
 * Used only to lay nodes out in rows -- purely presentational, mirrors
 * (but does not import/reuse) engine/traversal.py::_depth, which is the
 * authoritative version used for root-cause ranking. Duplicating the idea
 * here is fine since this copy never feeds a score or a ranking -- only
 * pixel position.
 */
export function computeDepths(nodes: ConceptGraphNode[]): Map<string, number> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const depths = new Map<string, number>();

  function depthOf(id: string, seen: Set<string>): number {
    if (depths.has(id)) return depths.get(id)!;
    if (seen.has(id)) {
      throw new Error(`Cycle detected in conceptGraph.ts involving '${id}'`);
    }
    const node = byId.get(id);
    if (!node) throw new Error(`Unknown concept id '${id}' referenced as a prerequisite`);

    const d = node.prerequisites.length === 0
      ? 0
      : 1 + Math.max(...node.prerequisites.map((p) => depthOf(p, new Set(seen).add(id))));

    depths.set(id, d);
    return d;
  }

  for (const n of nodes) depthOf(n.id, new Set());
  return depths;
}