import { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, Mesh, Raycaster, Vector2, Vector3, Plane, Color } from 'three';
import type { TableItem } from '../../../types/table';
import { Text } from '@react-three/drei';
import { validateAndSnapPosition, alignToNearestRowColumn } from '../../../utils/gridUtils';

interface Table3DProps {
    table: TableItem;
    onClick: () => void;
    isSelected: boolean;
    isDragging: boolean;
    onDragStart: (tableId: number) => void;
    onDragEnd: (tableId: number, newX: number, newZ: number) => void;
    allTables?: TableItem[];
}

export function Table3DManagement({
    table,
    onClick,
    isSelected,
    isDragging,
    onDragStart,
    onDragEnd,
    allTables = [],
}: Table3DProps) {
    const groupRef = useRef<Group>(null);
    const tableTopRef = useRef<Mesh>(null);
    const { camera } = useThree();
    const [isLocalDragging, setIsLocalDragging] = useState(false);
    const raycasterRef = useRef(new Raycaster());
    const mouseRef = useRef(new Vector2());
    const planeRef = useRef(new Plane(new Vector3(0, 1, 0), -0.1));
    const intersectionPointRef = useRef(new Vector3());
    
    // Drag başladığı masa pozisyonunu sakla
    const dragStartTablePosRef = useRef<{ x: number; z: number }>({
        x: table.locationX,
        z: table.locationZ,
    });

    // Drag başladığı mouse pozisyonunu sakla
    const dragStartMouseRef = useRef<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });

    // Drag başladığı world pozisyonunu sakla (raycaster kesişim noktası)
    const dragStartWorldPosRef = useRef<{ x: number; z: number }>({
        x: 0,
        z: 0,
    });

    // Table güncellenince pozisyonları güncelle
    useEffect(() => {
        if (groupRef.current && !isLocalDragging) {
            groupRef.current.position.x = table.locationX;
            groupRef.current.position.z = table.locationZ;
        }
    }, [table.locationX, table.locationZ, isLocalDragging]);

    // Animasyon frame'i güncelle
    useFrame(() => {
        if (groupRef.current) {
            // Seçili masa dönsün ancak sadece sürüklenmediyse
            if (isSelected && !isLocalDragging) {
                groupRef.current.rotation.y += 0.01;
            } else if (!isSelected && !isLocalDragging) {
                groupRef.current.rotation.y = 0;
            }

            // Sürükleme sırasında masa şeffaf olsun
            if (tableTopRef.current && tableTopRef.current.material) {
                const material = tableTopRef.current.material as any;
                if (isLocalDragging) {
                    material.opacity = 0.7;
                    material.emissive.setHex(0x4f46e5);
                } else {
                    material.opacity = 1;
                    material.emissive.setHex(0x000000);
                }
            }
        }
    });

    const getTableColor = useCallback(() => {
        if (isLocalDragging) return '#8b5cf6';
        if (isSelected) return '#3b82f6';
        switch (table.status) {
            case 'Occupied':
                return '#ef4444';
            case 'OutOfOrder':
                return '#f59e0b';
            case 'Available':
                return '#10b981';
            default:
                return '#6b7280';
        }
    }, [table.status, isSelected, isLocalDragging]);

    /**
     * Mouse pozisyonundan world koordinatları hesapla (raycaster kullanarak)
     */
    const getWorldPositionFromMouse = useCallback((clientX: number, clientY: number): [number, number] => {
        const rect = (document.querySelector('canvas') as HTMLCanvasElement)?.getBoundingClientRect?.();
        const viewportWidth = rect?.width || window.innerWidth;
        const viewportHeight = rect?.height || window.innerHeight;
        const canvasLeft = rect?.left || 0;
        const canvasTop = rect?.top || 0;

        // Canvas'a göre relative koordinatlar
        const relativeX = clientX - canvasLeft;
        const relativeY = clientY - canvasTop;

        // NDC (Normalized Device Coordinates) hesapla
        mouseRef.current.x = (relativeX / viewportWidth) * 2 - 1;
        mouseRef.current.y = -(relativeY / viewportHeight) * 2 + 1;

        // Raycaster'ı ayarla
        raycasterRef.current.setFromCamera(mouseRef.current, camera);

        // Y = 0 düzleminde kesişimi bul
        raycasterRef.current.ray.intersectPlane(planeRef.current, intersectionPointRef.current);

        return [intersectionPointRef.current.x, intersectionPointRef.current.z];
    }, [camera]);

    const handlePointerDown = useCallback((e: any) => {
        e.stopPropagation();
        if (!isSelected) return;

        // Mouse down sırasında masa pozisyonunu sakla
        dragStartTablePosRef.current = {
            x: groupRef.current?.position.x || table.locationX,
            z: groupRef.current?.position.z || table.locationZ,
        };

        // İlk mouse pozisyonunu sakla
        dragStartMouseRef.current = {
            x: e.clientX,
            y: e.clientY,
        };

        // İlk world pozisyonunu hesapla (raycaster ile)
        const [worldX, worldZ] = getWorldPositionFromMouse(e.clientX, e.clientY);
        dragStartWorldPosRef.current = {
            x: worldX,
            z: worldZ,
        };

        setIsLocalDragging(true);
        onDragStart(table.id);
        document.body.style.cursor = 'grabbing';
    }, [isSelected, table.id, onDragStart, getWorldPositionFromMouse]);

    const handlePointerMove = useCallback((e: any) => {
        if (!isLocalDragging || !groupRef.current) return;

        e.stopPropagation();

        // Şu anki world pozisyonunu hesapla
        const [currentWorldX, currentWorldZ] = getWorldPositionFromMouse(e.clientX, e.clientY);

        // Başlangıç world pozisyonundan delta hesapla
        const worldDeltaX = currentWorldX - dragStartWorldPosRef.current.x;
        const worldDeltaZ = currentWorldZ - dragStartWorldPosRef.current.z;

        // Başlangıç masa pozisyonuna delta ekle
        let newX = dragStartTablePosRef.current.x + worldDeltaX;
        let newZ = dragStartTablePosRef.current.z + worldDeltaZ;

        // Pozisyonu doğrula ve snap et
        const [validX, validZ] = validateAndSnapPosition(newX, newZ);

        groupRef.current.position.x = validX;
        groupRef.current.position.z = validZ;
    }, [isLocalDragging, getWorldPositionFromMouse]);

    const handlePointerUp = useCallback((e: any) => {
        if (!isLocalDragging) return;

        e.stopPropagation();
        setIsLocalDragging(false);

        if (groupRef.current) {
            const currentX = groupRef.current.position.x;
            const currentZ = groupRef.current.position.z;

            // Sürükleme sırasında sürüklenen masa hariç diğer masaların pozisyonlarını al
            const otherTablePositions: [number, number][] = allTables
                .filter(t => t.id !== table.id)
                .map(t => [t.locationX, t.locationZ] as [number, number]);

            // Alignment uygula - en yakın satır/sütüne hizala
            const [alignedX, alignedZ] = alignToNearestRowColumn(
                [currentX, currentZ],
                otherTablePositions
            );

            // Final pozisyonu set et
            groupRef.current.position.x = alignedX;
            groupRef.current.position.z = alignedZ;

            // Backend'e gönder
            onDragEnd(table.id, alignedX, alignedZ);
        }

        document.body.style.cursor = 'default';
    }, [isLocalDragging, table.id, onDragEnd, allTables]);

    useEffect(() => {
        if (isLocalDragging) {
            const handleMove = (e: PointerEvent) => handlePointerMove(e);
            const handleUp = (e: PointerEvent) => handlePointerUp(e);

            document.addEventListener('pointermove', handleMove, { passive: false });
            document.addEventListener('pointerup', handleUp, { passive: false });

            return () => {
                document.removeEventListener('pointermove', handleMove);
                document.removeEventListener('pointerup', handleUp);
            };
        }
    }, [isLocalDragging, handlePointerMove, handlePointerUp]);

    return (
        <group
            ref={groupRef}
            position={[table.locationX, 0, table.locationZ]}
            onPointerDown={handlePointerDown}
            onPointerOver={(e) => {
                if (isSelected && !isLocalDragging) {
                    e.stopPropagation();
                    document.body.style.cursor = 'grab';
                }
            }}
            onPointerOut={() => {
                if (!isLocalDragging) {
                    document.body.style.cursor = 'default';
                }
            }}
        >
            {/* Masa bacakları */}
            <mesh position={[-0.8, -0.5, -0.8]} castShadow receiveShadow>
                <boxGeometry args={[0.15, 1.2, 0.15]} />
                <meshStandardMaterial color="#8b7355" metalness={0.4} roughness={0.6} />
            </mesh>
            <mesh position={[0.8, -0.5, -0.8]} castShadow receiveShadow>
                <boxGeometry args={[0.15, 1.2, 0.15]} />
                <meshStandardMaterial color="#8b7355" metalness={0.4} roughness={0.6} />
            </mesh>
            <mesh position={[-0.8, -0.5, 0.8]} castShadow receiveShadow>
                <boxGeometry args={[0.15, 1.2, 0.15]} />
                <meshStandardMaterial color="#8b7355" metalness={0.4} roughness={0.6} />
            </mesh>
            <mesh position={[0.8, -0.5, 0.8]} castShadow receiveShadow>
                <boxGeometry args={[0.15, 1.2, 0.15]} />
                <meshStandardMaterial color="#8b7355" metalness={0.4} roughness={0.6} />
            </mesh>

            {/* Masa üstü */}
            <mesh 
                ref={tableTopRef} 
                position={[0, 0.1, 0]} 
                onClick={onClick}
                castShadow
                receiveShadow
            >
                <cylinderGeometry args={[1, 1, 0.1, 32]} />
                <meshStandardMaterial
                    color={getTableColor()}
                    metalness={0.5}
                    roughness={0.3}
                    transparent
                    opacity={1}
                    emissive={new Color()}
                />
            </mesh>

            {/* Masa adı */}
            <Text
                position={[0, 0.5, 0.01]}
                fontSize={0.3}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
            >
                {`${table.name}`}
            </Text>

            {/* Kapasite bilgisi */}
            <Text
                position={[0, 0.15, 0.01]}
                fontSize={0.18}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
            >
                {`👥 ${table.capacity}`}
            </Text>

            {/* Status göstergesi */}
            {isSelected && (
                <mesh position={[0, 1.2, 0]}>
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshStandardMaterial 
                        color="#3b82f6" 
                        emissive="#3b82f6"
                        emissiveIntensity={0.5}
                    />
                </mesh>
            )}
        </group>
    );
}