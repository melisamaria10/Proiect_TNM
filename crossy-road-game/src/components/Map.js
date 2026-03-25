import * as THREE from "three";
import { generateRows } from "../utilities/generateRows";
import { Grass } from "./Grass";
import { Road } from "./Road";
import { Tree } from "./Tree";
import { Car } from "./Car";
import { Truck } from "./Truck";
import { getBiomeForRow } from "../biome";

export const metadata = [];

export const map = new THREE.Group();

export function initializeMap() {
   // Remove all rows
  metadata.length = 0;
  map.remove(...map.children);
  
  for (let rowIndex = 0; rowIndex > -9; rowIndex--) {
    const biome = getBiomeForRow(rowIndex);
    const grass = Grass(rowIndex, biome);
    map.add(grass);
  }
  addRows();
}

export function addRows() {
  const newMetadata = generateRows(20);

  const startIndex = metadata.length;
  metadata.push(...newMetadata);

  newMetadata.forEach((rowData, index) => {
    const rowIndex = startIndex + index + 1;
    const biome = getBiomeForRow(rowIndex);

    if (rowData.type === "forest") {
      const row = Grass(rowIndex, biome);

      rowData.trees.forEach(({ tileIndex, height }) => {
        const three = Tree(tileIndex, height, biome);
        row.add(three);
      });

      map.add(row);
    }

    if (rowData.type === "car") {
      const row = Road(rowIndex);

      rowData.vehicles.forEach((vehicle) => {
        const car = Car(
          vehicle.initialTileIndex,
          rowData.direction,
          vehicle.color
        );
        vehicle.ref = car;
        row.add(car);
      });

      map.add(row);
    }

    if (rowData.type === "truck") {
      const row = Road(rowIndex);

      rowData.vehicles.forEach((vehicle) => {
        const truck = Truck(
          vehicle.initialTileIndex,
          rowData.direction,
          vehicle.color
        );
        vehicle.ref = truck;
        row.add(truck);
      });

      map.add(row);
    }
  });
}