"use client";

import type React from "react";
import { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ObjectItem {
  id: string;
  name: string;
  description: string;
}

interface ObjectContextType {
  objects: ObjectItem[];
  addObject: (object: Omit<ObjectItem, "id">) => Promise<void>;
  renameObject: (
    id: string,
    name: string,
    description?: string
  ) => Promise<void>;
  getObjectCount: () => number;
  MAX_OBJECTS: number;
  selectedObject: ObjectItem | null;
  setSelectedObject: (object: ObjectItem | null) => void;
}

const ObjectContext = createContext<ObjectContextType | undefined>(undefined);

export const ObjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [objects, setObjects] = useState<ObjectItem[]>([]);
  const [selectedObject, setSelectedObject] = useState<ObjectItem | null>(null);
  const MAX_OBJECTS = 3;

  useEffect(() => {
    // Load objects from AsyncStorage on app start
    const loadObjects = async () => {
      try {
        const storedObjects = await AsyncStorage.getItem("objects");
        if (storedObjects) {
          setObjects(JSON.parse(storedObjects));
        }
      } catch (error) {
        console.error("Failed to load objects from storage", error);
      }
    };

    loadObjects();
  }, []);

  const saveObjects = async (newObjects: ObjectItem[]) => {
    try {
      await AsyncStorage.setItem("objects", JSON.stringify(newObjects));
    } catch (error) {
      console.error("Failed to save objects to storage", error);
    }
  };

  const addObject = async (object: Omit<ObjectItem, "id">) => {
    if (objects.length >= MAX_OBJECTS) {
      throw new Error("Maximum number of objects reached");
    }

    const newObject = {
      id: Date.now().toString(),
      ...object,
    };

    const updatedObjects = [...objects, newObject];
    setObjects(updatedObjects);
    await saveObjects(updatedObjects);
  };

  // Add renameObject function to update object name and description
  const renameObject = async (
    id: string,
    name: string,
    description?: string
  ) => {
    const updatedObjects = objects.map((obj) => {
      if (obj.id === id) {
        return {
          ...obj,
          name,
          // Keep existing description if new one is not provided
          description:
            description !== undefined ? description : obj.description,
        };
      }
      return obj;
    });

    setObjects(updatedObjects);
    await saveObjects(updatedObjects);

    // Update selectedObject if it's the one being renamed
    if (selectedObject?.id === id) {
      setSelectedObject({
        ...selectedObject,
        name,
        description:
          description !== undefined ? description : selectedObject.description,
      });
    }
  };

  const getObjectCount = () => objects.length;

  return (
    <ObjectContext.Provider
      value={{
        objects,
        addObject,
        renameObject,
        getObjectCount,
        MAX_OBJECTS,
        selectedObject,
        setSelectedObject,
      }}
    >
      {children}
    </ObjectContext.Provider>
  );
};

export const useObjects = () => {
  const context = useContext(ObjectContext);
  if (context === undefined) {
    throw new Error("useObjects must be used within an ObjectProvider");
  }
  return context;
};
