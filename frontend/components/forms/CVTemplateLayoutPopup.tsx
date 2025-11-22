"use client";

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { X, RefreshCcw, LayoutTemplate, GripVertical, GripHorizontal, AlertCircle } from "lucide-react";

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
    { id: 1, label: "Hero Section", gridClass: "col-span-12 h-fit", colorTheme: "indigo", direction: "col" },
    { id: 2, label: "Thanh Thông Tin", gridClass: "col-span-12 h-fit", colorTheme: "slate", direction: "col" },
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
  
  // State quản lý thông báo cảnh báo
  const [warning, setWarning] = useState<string | null>(null);

  // Tự động tắt thông báo sau 3 giây
  useEffect(() => {
    if (warning) {
      const timer = setTimeout(() => setWarning(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [warning]);

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
    if (!result.destination) return;
    
    // 1. STRICT CHECK: Chặn kéo thả sang khu vực khác
    if (result.source.droppableId !== result.destination.droppableId) {
      // HIỂN THỊ THÔNG BÁO
      setWarning("Bạn chỉ có thể sắp xếp lại thứ tự trong cùng một khu vực!");
      return;
    }

    const placeId = parseInt(result.source.droppableId);

    // Lấy danh sách items của vùng hiện tại
    const items = Object.entries(positions)
      .filter(([_, pos]) => pos.place === placeId)
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([key]) => key);

    // Reorder logic
    const newItems = [...items];
    const [moved] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, moved);
    
    const newPositions = { ...positions };
    newItems.forEach((key, index) => {
      newPositions[key] = { ...newPositions[key], order: index };
    });
    
    setPositions(newPositions);
    setWarning(null); // Tắt cảnh báo nếu kéo thả thành công
  };

  const handleReset = () => {
    if (confirm("Bạn có chắc muốn đặt lại bố cục mặc định?")) {
      setPositions(defaultPositions);
    }
  };

  const getColorStyles = (theme: string, isDraggingOver: boolean) => {
    const styles = {
      blue: isDraggingOver ? "bg-blue-100 border-blue-400" : "bg-blue-50/50 border-blue-200",
      green: isDraggingOver ? "bg-emerald-100 border-emerald-400" : "bg-emerald-50/50 border-emerald-200",
      slate: isDraggingOver ? "bg-slate-200 border-slate-400" : "bg-slate-100 border-slate-200",
      indigo: isDraggingOver ? "bg-indigo-100 border-indigo-400" : "bg-indigo-50/50 border-indigo-200",
    };
    return styles[theme as keyof typeof styles] || styles.slate;
  };

  const getHeaderColor = (theme: string) => {
    const colors = { blue: "bg-blue-600", green: "bg-emerald-600", slate: "bg-slate-600", indigo: "bg-indigo-600" };
    return colors[theme as keyof typeof colors] || "bg-slate-600";
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[1000px] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-200 relative">
        
        {/* HEADER */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><LayoutTemplate size={20} /></div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Chỉnh sửa bố cục</h2>
              <p className="text-xs text-slate-500">Template: <span className="font-semibold text-blue-600">{templateTitle}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"><X size={22} /></button>
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
          {warning && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 border border-slate-700 max-w-md">
                <AlertCircle className="text-red-400 shrink-0" size={20} />
                <div>
                   <p className="text-sm font-medium text-red-200">Không thể di chuyển!</p>
                   <p className="text-xs text-slate-300">{warning}</p>
                </div>
                <button 
                  onClick={() => setWarning(null)}
                  className="ml-2 p-1 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X size={14} className="text-slate-400" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-between items-center shrink-0 z-10">
          <button onClick={handleReset} className="text-slate-500 hover:text-red-600 text-sm font-medium flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
            <RefreshCcw size={16} /> Đặt lại mặc định
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 bg-slate-50 border border-slate-200 rounded-lg transition-colors">Hủy</button>
            <button onClick={() => { onSave(positions); onClose(); }} className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-md shadow-blue-200 transition-all">Lưu bố cục mới</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVTemplateLayoutPopup;