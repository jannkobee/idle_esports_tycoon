import { Children, isValidElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { EvolvingRig } from './EquipmentModels3D';
import { EQUIPMENT_TIERS } from '../../../core/facilities/equipmentProgression';

// Evaluate the pure model tree, including Display children, without a WebGL context.
function geometry(node: ReactNode): unknown[] {
  const result: unknown[] = [];
  Children.forEach(node, child => {
    if (!isValidElement<{ children?: ReactNode; args?: unknown[] }>(child)) return;
    if (typeof child.type === 'function') {
      result.push(...geometry((child.type as (props: unknown) => ReactNode)(child.props)));
    } else {
      if (typeof child.type === 'string' && child.type.endsWith('Geometry')) result.push([child.type, child.props.args]);
      result.push(...geometry(child.props.children));
    }
  });
  return result;
}

describe('PC model geometry', () => {
  it('renders six distinct silhouettes with a bounded final model for both rig sizes', () => {
    for (const compact of [false, true]) {
      const signatures = EQUIPMENT_TIERS.map(({ level }) => {
        const shapes = geometry(EvolvingRig({ x: 0, z: 0, level, compact }));
        expect(shapes[0]).toEqual(['boxGeometry', [compact ? 0.85 : 1.44, 0.07, compact ? 0.58 : 0.94]]);
        expect(shapes.length).toBeLessThan(70);
        return JSON.stringify(shapes);
      });
      expect(new Set(signatures).size).toBe(6);
      expect(JSON.stringify(geometry(EvolvingRig({ x: 0, z: 0, level: 10000, compact })))).toBe(signatures[5]);
    }
  });
});
