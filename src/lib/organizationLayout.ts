import ELK from 'elkjs/lib/elk.bundled.js';
import { Employee } from '@/types/organization';

const elk = new ELK();
export const CARD_WIDTH = 248;
export const CARD_HEIGHT = 126;
export interface EmployeePosition { x: number; y: number; compact: boolean; busY?: number }

// ELK arranges the management levels and branch bounds. Large groups of peers use
// columns, so 19 direct reports do not produce a several-thousand-pixel-wide row.
// Every visible edge still points to the actual manager, never to a sibling.
export async function layoutOrganization(employees: Employee[]): Promise<Map<string, EmployeePosition>> {
  const byId = new Map(employees.map(e => [e.id, e]));
  const hasChildren = new Set(employees.map(e => e.manager_id).filter(Boolean));
  const packed = new Set<string>();
  const groups: { id: string; parent: string; people: Employee[] }[] = [];
  for (const parent of employees) {
    const leaves = employees.filter(e => e.manager_id === parent.id && !hasChildren.has(e.id));
    if (leaves.length < 4) continue;
    const columnCount = Math.min(3, Math.ceil(leaves.length / 4));
    const perColumn = Math.ceil(leaves.length / columnCount);
    for (let col = 0; col < columnCount; col++) {
      const people = leaves.slice(col * perColumn, (col + 1) * perColumn);
      people.forEach(e => packed.add(e.id));
      groups.push({ id: `__column_${parent.id}_${col}`, parent: parent.id, people });
    }
  }
  const regular = employees.filter(e => !packed.has(e.id));
  const result = await elk.layout({
    id: 'organization',
    layoutOptions: { 'elk.algorithm': 'layered', 'elk.direction': 'DOWN', 'elk.spacing.nodeNode': '36',
      'elk.layered.spacing.nodeNodeBetweenLayers': '76', 'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES', 'elk.edgeRouting': 'ORTHOGONAL' },
    children: [
      ...regular.map(e => ({ id: e.id, width: CARD_WIDTH, height: CARD_HEIGHT })),
      ...groups.map(g => ({ id: g.id, width: CARD_WIDTH + 24, height: g.people.length * (CARD_HEIGHT + 20) - 20 })),
    ],
    edges: [
      ...regular.filter(e => e.manager_id && byId.has(e.manager_id)).map(e => ({ id: `link_${e.id}`, sources: [e.manager_id!], targets: [e.id] })),
      ...groups.map(g => ({ id: `link_${g.id}`, sources: [g.parent], targets: [g.id] })),
    ],
  });
  const positions = new Map<string, EmployeePosition>();
  for (const node of result.children || []) {
    const group = groups.find(g => g.id === node.id);
    if (group) group.people.forEach((e, i) => positions.set(e.id, { x: (node.x || 0) + 24, y: (node.y || 0) + i * (CARD_HEIGHT + 20), compact: true, busY: (node.y || 0) - 32 }));
    else positions.set(node.id, { x: node.x || 0, y: node.y || 0, compact: false });
  }
  // Center each manager above the compact columns of their own direct team.
  for (const parent of employees) {
    const columns = groups.filter(g => g.parent === parent.id);
    if (!columns.length) continue;
    const peers = columns.flatMap(g => g.people).map(e => positions.get(e.id)!);
    const point = positions.get(parent.id)!;
    point.x = (Math.min(...peers.map(p => p.x)) + Math.max(...peers.map(p => p.x))) / 2;
  }
  return positions;
}
