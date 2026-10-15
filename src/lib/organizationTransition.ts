import type { Node, Edge } from '@xyflow/react';

export const ORGANIZATION_TRANSITION_MS = 300;

// Interpolate controlled positions so React Flow keeps edge endpoints attached.
export function organizationTransition<N extends Node>(before: N[], after: N[], oldEdges: Edge[], newEdges: Edge[]) {
  const previous = new Map(before.map(node => [node.id, node]));
  const next = new Map(after.map(node => [node.id, node]));
  const previousEdges = new Map(oldEdges.map(edge => [edge.id, edge]));
  const nextEdges = new Set(newEdges.map(edge => edge.id));
  return (progress: number): { nodes: N[]; edges: Edge[] } => {
    if (progress >= 1) return { nodes: after, edges: newEdges };
    const t = 1 - Math.pow(1 - Math.max(0, progress), 3);
    const opacity = (node: N) => Number(node.style?.opacity ?? 1);
    const nodes: N[] = after.map(node => {
      const old = previous.get(node.id);
      const start = old?.position || { x: node.position.x, y: node.position.y - 12 };
      return { ...node, position: { x: start.x + (node.position.x - start.x) * t, y: start.y + (node.position.y - start.y) * t },
        style: { ...node.style, opacity: (old ? opacity(old) : 0) * (1 - t) + t } };
    });
    for (const old of before) if (!next.has(old.id)) nodes.push({ ...old, selected: false, selectable: false, focusable: false,
      style: { ...old.style, opacity: opacity(old) * (1 - t), pointerEvents: 'none' },
      domAttributes: { ...old.domAttributes, 'aria-hidden': true, inert: '' } } as N);
    const edges: Edge[] = newEdges.map(edge => {
      const old = previousEdges.get(edge.id);
      const from = old?.data?.busY, to = edge.data?.busY;
      return { ...edge, data: { ...edge.data, ...(typeof from === 'number' && typeof to === 'number' ? { busY: from + (to - from) * t } : {}) },
        style: { ...edge.style, opacity: Number(old?.style?.opacity ?? (old ? 1 : 0)) * (1 - t) + t } };
    });
    for (const old of oldEdges) if (!nextEdges.has(old.id)) edges.push({ ...old, style: { ...old.style, opacity: Number(old.style?.opacity ?? 1) * (1 - t) } });
    return { nodes, edges };
  };
}
