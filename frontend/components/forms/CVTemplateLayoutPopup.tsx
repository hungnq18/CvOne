"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { X, RefreshCcw, LayoutTemplate, GripVertical, GripHorizontal, Sparkles } from "lucide-react";
import { notify } from "@/lib/notify";

// --- TYPES ---
interface SectionPositions {
  [key: string]: {
    place: number;
    order: number;
  };
}

interface CVTemplateLayoutPopupProps {
  currentPositions?: SectionPositions;
  defaultPositions: SectionPositions;
  templateTitle: string;
  onSave: (newPositions: SectionPositions) => void;
  onClose: () => void;
}

// --- CONFIGURATION ---
interface PlaceConfig {
  id: number;
  label: string;
  gridClass: string;
  colorTheme: "blue" | "green" | "slate" | "indigo";
  direction?: "row" | "col";
}

const LAYOUT_CONFIGS: Record<string, PlaceConfig[]> = {
  "The Signature": [
    { id: 1, label: "Sidebar (Trái)", gridClass: "col-span-4 h-full", colorTheme: "slate", direction: "col" },
    { id: 2, label: "Nội dung chính (Phải)", gridClass: "col-span-8 h-full", colorTheme: "blue", direction: "col" },
  ],
  "The Vanguard": [
    { id: 1, label: "Header (Avatar & Info)", gridClass: "col-span-8 h-fit", colorTheme: "green", direction: "row" },
    { id: 2, label: "Sidebar (Phải)", gridClass: "col-span-4 row-span-2 h-full", colorTheme: "slate", direction: "col" },
    { id: 3, label: "Nội dung (Dưới Header)", gridClass: "col-span-8 h-full", colorTheme: "green", direction: "col" },
  ],
  "The Modern": [
    // { id: 1, label: "Avatar", gridClass: "col-span-12 h-fit", colorTheme: "slate", direction: "col" },
    // { id: 2, label: "Thanh Thông Tin", gridClass: "col-span-12 h-fit", colorTheme: "slate", direction: "col" },
    { id: 3, label: "Nội dung chính", gridClass: "col-span-12 h-full", colorTheme: "blue", direction: "col" },
  ],
  "The Minimalist": [
    { id: 1, label: "Sidebar (Trái)", gridClass: "col-span-4 h-full", colorTheme: "green", direction: "col" },
    { id: 2, label: "Nội dung chính (Phải)", gridClass: "col-span-8 h-full", colorTheme: "slate", direction: "col" },
  ],
};

const DEFAULT_LAYOUT: PlaceConfig[] = [
  { id: 1, label: "Cột Trái", gridClass: "col-span-4 h-full", colorTheme: "slate", direction: "col" },
  { id: 2, label: "Cột Phải", gridClass: "col-span-8 h-full", colorTheme: "blue", direction: "col" }
];

const CVTemplateLayoutPopup: React.FC<CVTemplateLayoutPopupProps> = ({
  currentPositions,
  defaultPositions,
  templateTitle,
  onSave,
  onClose,
}) => {
  const [positions, setPositions] = useState<SectionPositions>(
    currentPositions || defaultPositions
  );

  const getTemplateConfig = () => {
    let config = LAYOUT_CONFIGS[templateTitle];
    if (!config) {
      const key = Object.keys(LAYOUT_CONFIGS).find(k => templateTitle.includes(k) || k.includes(templateTitle));
      if (key) config = LAYOUT_CONFIGS[key];
    }
    return (config || DEFAULT_LAYOUT).filter(c => c.id !== 0);
  };

  const layoutConfig = getTemplateConfig();

  const handleDragEnd = (result: any) => {
    if (!result.destination) {
      notify.error("Bạn chỉ có thể thả mục trong khu vực bố cục cho phép.");
      return;
    }
    
    if (result.source.droppableId !== result.destination.droppableId) {
      notify.error("Bạn chỉ có thể sắp xếp lại thứ tự trong cùng một khu vực!");
      return;
    }

    const placeId = parseInt(result.source.droppableId);
    const items = Object.entries(positions)
      .filter(([_, pos]) => pos.place === placeId)
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([key]) => key);

    const newItems = [...items];
    const [moved] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, moved);
    
    const newPositions = { ...positions };
    newItems.forEach((key, index) => {
      newPositions[key] = { ...newPositions[key], order: index };
    });
    
    setPositions(newPositions);
  };

  const handleReset = () => {
    if (confirm("Bạn có chắc muốn đặt lại bố cục mặc định?")) {
      setPositions(defaultPositions);
    }
  };

  const getColorStyles = (theme: string, isDraggingOver: boolean) => {
    const styles = {
      blue: isDraggingOver 
        ? "bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-400 shadow-inner" 
        : "bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border-blue-200/80",
      green: isDraggingOver 
        ? "bg-gradient-to-br from-emerald-100 to-teal-100 border-emerald-400 shadow-inner" 
        : "bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border-emerald-200/80",
      slate: isDraggingOver 
        ? "bg-gradient-to-br from-slate-200 to-gray-200 border-slate-400 shadow-inner" 
        : "bg-gradient-to-br from-slate-100/80 to-gray-100/50 border-slate-200/80",
      indigo: isDraggingOver 
        ? "bg-gradient-to-br from-indigo-100 to-violet-100 border-indigo-400 shadow-inner" 
        : "bg-gradient-to-br from-indigo-50/80 to-violet-50/50 border-indigo-200/80",
    };
    return styles[theme as keyof typeof styles] || styles.slate;
  };

  const getHeaderColor = (theme: string) => {
    const colors = { 
      blue: "bg-gradient-to-r from-blue-600 to-indigo-600", 
      green: "bg-gradient-to-r from-emerald-600 to-teal-600", 
      slate: "bg-gradient-to-r from-slate-600 to-gray-600", 
      indigo: "bg-gradient-to-r from-indigo-600 to-violet-600" 
    };
    return colors[theme as keyof typeof colors] || "bg-slate-600";
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1000px] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-200 relative">
        
        {/* HEADER - Redesigned */}
        <div className="relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzMyIgb3BhY2l0eT0iMC4xIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
          <div className="relative px-6 py-5 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30">
                <LayoutTemplate size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Chỉnh sửa bố cục
                  <Sparkles size={16} className="text-amber-400" />
                </h2>
                <p className="text-xs text-slate-400">Template: <span className="font-semibold text-blue-400">{templateTitle}</span></p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
              <X size={22} />
            </button>
          </div>
        </div>

        {/* MAIN PREVIEW AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100/80 flex justify-center items-start relative">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="bg-white shadow-xl border border-slate-200 w-full max-w-[800px] h-fit min-h-[300px] p-6 md:p-8 relative rounded-sm">
              <div className="grid grid-cols-12 gap-4 auto-rows-min">
                
                {layoutConfig.map((config) => {
                  const sections = Object.entries(positions)
                    .filter(([_, pos]) => pos.place === config.id)
                    .sort(([, a], [, b]) => a.order - b.order)
                    .map(([key]) => key);

                  const isRow = config.direction === "row";

                  return (
                    <div key={config.id} className={`${config.gridClass} flex flex-col transition-all duration-300`}>
                      <Droppable 
                        droppableId={config.id.toString()} 
                        direction={isRow ? "horizontal" : "vertical"}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`
                              flex-1 rounded-lg border-2 border-dashed flex p-3 gap-3 transition-colors duration-200
                              ${isRow ? "flex-col" : "flex-col"} 
                              ${getColorStyles(config.colorTheme, snapshot.isDraggingOver)}
                            `}
                          >
                            {/* Header Area */}
                            <div className="flex items-center justify-between mb-1 w-full">
                              <span className={`text-[10px] font-bold uppercase tracking-wider text-white px-2 py-0.5 rounded ${getHeaderColor(config.colorTheme)}`}>
                                {config.label}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">{sections.length} mục</span>
                            </div>

                            {/* Draggable Items */}
                            <div className={`flex-1 flex gap-2 ${isRow ? "flex-row items-stretch min-h-[60px]" : "flex-col min-h-[100px]"}`}>
                              {sections.length === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs opacity-60 w-full py-4">
                                  <LayoutTemplate size={20} className="mb-1" />
                                  <span>Trống</span>
                                </div>
                              )}
                              
                              {sections.map((id, index) => (
                                <Draggable key={id} draggableId={id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`
                                        group flex items-center gap-3 p-3 rounded-md border shadow-sm cursor-grab active:cursor-grabbing
                                        ${isRow ? "flex-1 justify-center min-w-[120px]" : "w-full"} 
                                        ${snapshot.isDragging 
                                          ? "bg-blue-600 text-white border-blue-700 shadow-xl scale-105 z-50 ring-2 ring-blue-300" 
                                          : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:shadow-md"
                                        }
                                      `}
                                    >
                                      {isRow ? (
                                         <GripHorizontal size={16} className={`shrink-0 ${snapshot.isDragging ? "text-white/70" : "text-slate-300 group-hover:text-blue-400"}`} />
                                      ) : (
                                         <GripVertical size={16} className={`shrink-0 ${snapshot.isDragging ? "text-white/70" : "text-slate-300 group-hover:text-blue-400"}`} />
                                      )}
                                      
                                      <span className="text-sm font-semibold capitalize truncate">{id}</span>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </div>
          </DragDropContext>

          {/* --- THÔNG BÁO TOAST (LOCAL) --- */}
        </div>

        {/* FOOTER - Redesigned */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex justify-between items-center shrink-0">
          <button 
            onClick={handleReset} 
            className="group text-slate-500 hover:text-red-600 text-sm font-medium flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
          >
            <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> 
            Đặt lại mặc định
          </button>
          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              Hủy
            </button>
            <button 
              onClick={() => { onSave(positions); onClose(); }} 
              className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 active:scale-[0.98] rounded-xl shadow-lg shadow-blue-500/25 transition-all"
            >
              ✨ Lưu bố cục mới
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVTemplateLayoutPopup;