"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import CytoscapeComponent from "react-cytoscapejs";
import { useBookStore } from "@/stores/book";

// Types for props and data
interface CharacterGraphProps {
  height?: string;
  onRelationshipSelected?: (relationship: {
    source: string;
    target: string;
    type: string;
    description: string;
  }) => void;
}

export default function CharacterGraph({
  height = "600px",
  onRelationshipSelected,
}: CharacterGraphProps) {
  const [dimensions, setDimensions] = useState({
    width: "100%",
    height,
  });

  const [selectedElements, setSelectedElements] = useState<{
    nodes: string[];
    edges: string[];
  }>({ nodes: [], edges: [] });

  const { bookId, data, isLoading, isError, errorMessage } = useBookStore();

  // Process elements with useMemo to prevent unnecessary recalculation
  const elements = useMemo(() => {
    if (!data) return [];

    return [
      ...data.nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.id,
          weight: node.weight,
        },
        position: { x: 0, y: 0 }, // Layout will calculate positions
      })),
      ...data.edges.map((edge, index) => ({
        data: {
          id: `e${index}`,
          source: edge.source,
          target: edge.target,
          label: edge.type,
          description: edge.description,
          weight: edge.weight,
        },
      })),
    ];
  }, [data]);

  // Enhanced stylesheet with explicit color values that work with Cytoscape
  const cytoscapeStylesheet = useMemo(
    () => [
      {
        selector: "node",
        style: {
          label: "data(label)",
          // Modern color palette with explicit values
          "background-color": "#0ea5e9", // sky-500
          color: "#ffffff",
          "text-valign": "center",
          "text-halign": "center",
          "font-weight": "500",
          width: "mapData(weight, 1, 10, 40, 80)",
          height: "mapData(weight, 1, 10, 40, 80)",
          "text-outline-width": 2,
          "text-outline-color": "#0ea5e9", // sky-500
          "font-size": "14px",
          "border-width": 2,
          "border-color": "#bae6fd", // sky-200
          "border-opacity": 0.8,
          shape: "round-rectangle",
          "border-radius": 8,
        },
      },
      {
        selector: "edge",
        style: {
          width: "mapData(weight, 1, 5, 1, 4)",
          "line-color": "#94a3b8", // slate-400
          "target-arrow-color": "#64748b", // slate-500
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
          label: "data(label)",
          "font-size": "11px",
          "text-rotation": "autorotate",
          "text-background-color": "#ffffff",
          "text-background-opacity": 0.9,
          "text-background-padding": 3,
          "text-background-shape": "roundrectangle",
          color: "#334155", // slate-700
          "text-margin-y": -6,
        },
      },
      {
        selector: "node:selected",
        style: {
          "background-color": "#f97316", // orange-500
          "text-outline-color": "#f97316", // orange-500
          "border-width": 3,
          "border-color": "#fed7aa", // orange-200
        },
      },
      {
        selector: "edge:selected",
        style: {
          "line-color": "#f97316", // orange-500
          "target-arrow-color": "#f97316", // orange-500
          width: 3,
        },
      },
      {
        selector: ".highlighted",
        style: {
          "background-color": "#14b8a6", // teal-500
          "text-outline-color": "#14b8a6", // teal-500
          "line-color": "#14b8a6", // teal-500
          "target-arrow-color": "#14b8a6", // teal-500
          "border-color": "#99f6e4", // teal-200
        },
      },
    ],
    []
  );

  // Improved node click handler with relationship details
  const handleNodeClick = useCallback(
    // @ts-expect-error CytoscapeComponent types
    (event) => {
      const node = event.target;
      const cy = node.cy();

      // Clear previous highlights
      cy.elements().removeClass("highlighted");

      // Highlight connected edges and nodes
      const connectedEdges = node.connectedEdges();
      const connectedNodes = connectedEdges
        .connectedNodes()
        // @ts-expect-error CytoscapeComponent types
        .filter((n) => n.id() !== node.id());

      connectedEdges.addClass("highlighted");
      connectedNodes.addClass("highlighted");

      // Track selected elements
      setSelectedElements({
        // @ts-expect-error CytoscapeComponent types
        nodes: [node.id(), ...connectedNodes.map((n) => n.id())],
        // @ts-expect-error CytoscapeComponent types
        edges: connectedEdges.map((e) => e.id()),
      });

      // Log and notify parent about relationships
      // @ts-expect-error CytoscapeComponent types
      connectedEdges.forEach((edge) => {
        const data = edge.data();

        if (onRelationshipSelected) {
          onRelationshipSelected({
            source: data.source,
            target: data.target,
            type: data.label,
            description: data.description,
          });
        }
      });
    },
    [onRelationshipSelected]
  );

  // Responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const newHeight = window.innerHeight < 768 ? "400px" : height;
      setDimensions({
        width: "100%",
        height: newHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [height]);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: dimensions.height }}
      >
        <div className="flex flex-col items-center text-sky-500">
          <div className="h-10 w-10 animate-spin">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-10 w-10"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <p className="mt-3 text-sm font-medium text-slate-600">
            Loading character relationships for book {bookId}...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
        <h3 className="mb-2 font-semibold">Error loading character graph</h3>
        <p className="text-sm">{errorMessage}</p>
      </div>
    );
  }

  if (!data || elements.length === 0) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-700">
        <h3 className="mb-2 font-semibold">No character data available</h3>
        <p className="text-sm">
          There are no character relationships to display for this section.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col">
      <CytoscapeComponent
        elements={elements}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: "0.5rem",
          border: "1px solid #e2e8f0", // slate-200
          overflow: "hidden",
        }}
        stylesheet={cytoscapeStylesheet}
        // @ts-expect-error CytoscapeComponent types
        layout={{
          name: "cose",
          animate: true,
          nodeDimensionsIncludeLabels: true,
          idealEdgeLength: 100,
          nodeOverlap: 20,
          refresh: 20,
          fit: true,
          padding: 30,
          randomize: false,
          componentSpacing: 100,
          nodeRepulsion: 450000,
          edgeElasticity: 100,
          nestingFactor: 5,
          gravity: 80,
          numIter: 1500,
          initialTemp: 200,
          coolingFactor: 0.95,
          minTemp: 1.0,
        }}
        cy={(cy) => {
          cy.removeAllListeners(); // Remove any existing listeners first
          cy.on("tap", "node", handleNodeClick);

          // Add zoom controls
          cy.on("mouseover", (event) => {
            if (event.target === cy) {
              cy.userZoomingEnabled(true);
              cy.userPanningEnabled(true);
            }
          });
        }}
      />

      {/* Enhanced Legend and Instructions with modern styling */}
      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center space-x-4">
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-sky-500"></div>
            <span className="text-sm font-medium text-slate-700">
              Characters
            </span>
          </div>

          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-teal-500"></div>
            <span className="text-sm font-medium text-slate-700">
              Highlighted
            </span>
          </div>

          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-orange-500"></div>
            <span className="text-sm font-medium text-slate-700">Selected</span>
          </div>
        </div>

        <div className="space-y-1 text-xs text-slate-500">
          <p>
            <span className="font-medium">Instructions:</span> Click on a
            character to see their relationships.
            {selectedElements.nodes.length > 0 && (
              <span className="ml-2 text-slate-700">
                Selected: {selectedElements.nodes[0]} (
                {selectedElements.edges.length} relationships)
              </span>
            )}
          </p>
          <p>
            Node size indicates character importance. Edge thickness represents
            relationship strength.
          </p>
        </div>
      </div>
    </div>
  );
}
