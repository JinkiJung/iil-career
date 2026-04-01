import type { ComponentType } from 'react';
import type { HeroComponentProps } from './types';

import { SeaWaveChat } from './SeaWaveChat';
import { IdentityConstellation } from './IdentityConstellation';
import { NetworkGraph } from './NetworkGraph';
import { ScriptFlowEngine } from './ScriptFlowEngine';
import { ParallaxDepthLayers } from './ParallaxDepthLayers';
import { FeatureTracker } from './FeatureTracker';
import { StateMachineOrbit } from './StateMachineOrbit';

const heroRegistry: Record<string, ComponentType<HeroComponentProps>> = {
    'iil-career.SeaWaveChat': SeaWaveChat,
    'iil-career.IdentityConstellation': IdentityConstellation,
    'iil-career.NetworkGraph': NetworkGraph,
    'iil-career.ScriptFlowEngine': ScriptFlowEngine,
    'iil-career.ParallaxDepthLayers': ParallaxDepthLayers,
    'iil-career.FeatureTracker': FeatureTracker,
    'iil-career.StateMachineOrbit': StateMachineOrbit,
};

export function resolveHeroComponent(
    figure: string | undefined
): ComponentType<HeroComponentProps> | null {
    if (!figure) return null;
    return heroRegistry[figure] ?? null;
}
