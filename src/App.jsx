import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Room from './scene/Room';
import Lights from './scene/Lights';
import CameraRig, { CAMERA_FOV, INITIAL_CAMERA_POSITION } from './scene/CameraRig';
import { objects } from './content';
import { useReducedMotion } from './hooks/useReducedMotion';
import { FocusProvider, useFocus } from './hooks/useFocus';
import GamesPanel from './panels/GamesPanel';
import SketchGallery from './panels/SketchGallery';
import FootballPanel from './panels/FootballPanel';
import ReadingPanel from './panels/ReadingPanel';
import GithubPanel from './panels/GithubPanel';
import PanelShell from './panels/PanelShell';

function Viewer() {
  const reducedMotion = useReducedMotion();
  const { status, objectId, close } = useFocus();
  const activeObject = objects.find((object) => object.id === objectId);
  const panels = { monitor: GithubPanel, laptop: GamesPanel, sketchbook: SketchGallery, football: FootballPanel, bookshelf: ReadingPanel };
  const Panel = panels[objectId];
  useEffect(() => { document.title = 'Naman Raghav | 3D Room'; }, []);
  return (
    <div style={{ position: 'fixed', inset: 0, height: '100dvh', overflow: 'hidden' }}>
      <Canvas shadows camera={{ position: INITIAL_CAMERA_POSITION, fov: CAMERA_FOV }}
        gl={{ antialias: true, alpha: false }} style={{ width: '100%', height: '100%', touchAction: 'none' }}>
        <color attach="background" args={['#0a0d14']} />
        <Lights />
        <Suspense fallback={null}>
          <Room />
          <CameraRig reducedMotion={reducedMotion} />
        </Suspense>
      </Canvas>
      {status === 'focused' && (Panel
        ? <Panel isOpen onClose={close} data={activeObject} />
        : <PanelShell isOpen onClose={close} title={activeObject.title} />)}
    </div>
  );
}

export default function App() {
  return <FocusProvider><Viewer /></FocusProvider>;
}
