import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import { Table3D } from './Table3D';
import { useTableStore } from '../../store/tableStore';

interface OrdersSceneProps {
  onTableSelect: (tableId: number) => void;
}

export const OrdersScene: React.FC<OrdersSceneProps> = ({ onTableSelect }) => {
  const { tables, getTables, selectedTable, setSelectedTable } = useTableStore();

  useEffect(() => {
    getTables();
  }, [getTables]);

  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      dpr={window.devicePixelRatio}
    >
      <PerspectiveCamera
        makeDefault
        position={[0, 12, 15]}
        fov={50}
      />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        autoRotate={false}
        minDistance={5}
        maxDistance={30}
      />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
      />
      <pointLight position={[-10, 10, -10]} intensity={0.4} />

      <Grid
        args={[20, 20]}
        cellSize={1}
        cellColor="#6b7280"
        sectionSize={5}
        sectionColor="#374151"
        fadeStrength={1}
        fadeDistance={25}
      />

      {tables.map((table) => (
        <Table3D
          key={table.id}
          table={table}
          isSelected={selectedTable?.id === table.id}
          onClick={() => {
            setSelectedTable(table);
            onTableSelect(table.id);
          }}
        />
      ))}
    </Canvas>
  );
};