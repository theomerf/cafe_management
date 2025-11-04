import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import { Table3DManagement } from './Table3DManagement';
import type { TableItem } from '../../../types/table';
import type { BackendDataList } from '../../../types/backendDataList';
import { useRef, useCallback, useEffect } from 'react';

interface TablesSceneProps {
    tables: BackendDataList<TableItem>;
    onTableSelect: (tableId: number) => void;
    selectedTable: TableItem | null;
    setSelectedTable: (table: TableItem | null) => void;
    onTableLocationChange?: (tableId: number, newX: number, newZ: number) => void;
}

export default function TablesSceneManagement({
    tables,
    onTableSelect,
    selectedTable,
    setSelectedTable,
    onTableLocationChange,
}: TablesSceneProps) {
    const draggedTableRef = useRef<number | null>(null);
    const orbitControlsRef = useRef<any>(null);
    const dirLightRef = useRef<any>(null);

    const handleDragStart = useCallback((tableId: number) => {
        draggedTableRef.current = tableId;
        // OrbitControls'u disable et sürükleme sırasında
        if (orbitControlsRef.current) {
            orbitControlsRef.current.enabled = false;
        }
    }, []);

    const handleDragEnd = useCallback((tableId: number, newX: number, newZ: number) => {
        draggedTableRef.current = null;
        // OrbitControls'u tekrar aktif et
        if (orbitControlsRef.current) {
            orbitControlsRef.current.enabled = true;
        }
        onTableLocationChange?.(tableId, newX, newZ);
    }, [onTableLocationChange]);

    // configure directional light shadow map size after mount
    useEffect(() => {
        const dir = dirLightRef.current;
        if (dir && dir.shadow) {
            dir.shadow.mapSize.width = 2048;
            dir.shadow.mapSize.height = 2048;
            dir.shadow.needsUpdate = true;
        }
    }, []);

    return (
        <Canvas
            style={{ width: '100%', height: '100%' }}
            dpr={window.devicePixelRatio}
            gl={{ antialias: true, alpha: true }}
        >
            {/* Kamera */}
            <PerspectiveCamera 
                makeDefault 
                position={[0, 15, 18]} 
                fov={50}
                near={0.1}
                far={1000}
            />

            {/* OrbitControls - ref ile kontrol ediliyor */}
            <OrbitControls
                ref={orbitControlsRef}
                enableDamping
                dampingFactor={0.05}
                autoRotate={false}
                minDistance={8}
                maxDistance={40}
                enableRotate={true}
                enableZoom={true}
                enablePan={true}
            />

            {/* Işıklandırma */}
            <ambientLight intensity={0.7} />
            <directionalLight 
                ref={dirLightRef}
                position={[15, 20, 10]} 
                intensity={0.9} 
                castShadow
            />
            <pointLight position={[-15, 15, -15]} intensity={0.5} />

            {/* Grid */}
            <Grid
                args={[20, 20]}
                cellSize={1}
                cellColor="#9ca3af"
                sectionSize={5}
                sectionColor="#4b5563"
                fadeStrength={1}
                fadeDistance={30}
            />

            {/* Masalar */}
            {tables.data && tables.data.length > 0 ? (
                tables.data.map((table) => (
                    <Table3DManagement
                        key={table.id}
                        table={table}
                        isSelected={selectedTable?.id === table.id}
                        isDragging={draggedTableRef.current === table.id}
                        onClick={() => {
                            setSelectedTable(table);
                            onTableSelect(table.id);
                        }}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        allTables={tables.data ?? []} // Tüm masaları geç
                    />
                ))
            ) : null}
        </Canvas>
    );
}