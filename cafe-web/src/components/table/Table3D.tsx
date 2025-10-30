import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group, Mesh } from 'three';
import type { TableItem } from '../../types/table'; 
import { Text } from '@react-three/drei';

interface Table3DProps {
  table: TableItem;
  onClick: () => void;
  isSelected: boolean;
}

export const Table3D: React.FC<Table3DProps> = ({
  table,
  onClick,
  isSelected,
}) => {
  const groupRef = useRef<Group>(null);
  const tableTopRef = useRef<Mesh>(null);

  useFrame(() => {
    if (groupRef.current && isSelected) {
      groupRef.current.rotation.y += 0.01;
    }
    else {
      if (groupRef.current) {
        groupRef.current.rotation.y = 0;
      }
    }
  });

  const getTableColor = () => {
    if (isSelected) return '#3b82f6';
    switch (table.status) {
      case 'occupied':
        return '#ef4444';
      case 'reserved':
        return '#f59e0b';
      case 'available':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <group ref={groupRef} position={[table.position.x, 0, table.position.z]}>
      <mesh position={[-0.8, -0.5, -0.8]}>
        <boxGeometry args={[0.15, 1.2, 0.15]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
      <mesh position={[0.8, -0.5, -0.8]}>
        <boxGeometry args={[0.15, 1.2, 0.15]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
      <mesh position={[-0.8, -0.5, 0.8]}>
        <boxGeometry args={[0.15, 1.2, 0.15]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
      <mesh position={[0.8, -0.5, 0.8]}>
        <boxGeometry args={[0.15, 1.2, 0.15]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      <mesh
        ref={tableTopRef}
        position={[0, 0.1, 0]}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <cylinderGeometry args={[1, 1, 0.1, 32]} />
        <meshStandardMaterial
          color={getTableColor()}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

    <Text
      position={[0, 0.50, 0.01]}
      fontSize={0.25}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
    >
      {`T${table.tableNumber}`}
    </Text>
    </group>
  );
};