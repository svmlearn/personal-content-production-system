"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  assembleFullText,
  buildSectionsFromOutline,
  createDocument,
  findRelevantSources,
  generateDocumentOutline,
  generateExportPreview,
  generateSectionContent,
  rewriteContent,
  simulateApprovalStep,
  submitForApproval,
} from "@/lib/document-gen/engine";
import { defaultFormValues } from "@/lib/document-gen/templates";
import { getSourceById } from "@/lib/document-gen/sources";
import type {
  DocumentForm,
  DocumentType,
  ExportPreview,
  GeneratedDocument,
  OutputStyle,
  SourceMaterial,
} from "@/lib/document-gen/types";

export type DocView = "picker" | "form" | "outline" | "editor";

interface DocumentContextValue {
  view: DocView;
  setView: (v: DocView) => void;
  document: GeneratedDocument | null;
  selectType: (type: DocumentType) => void;
  updateForm: (key: string, value: string) => void;
  generateOutline: () => void;
  moveOutline: (index: number, direction: -1 | 1) => void;
  generateBody: () => void;
  updateSection: (id: string, content: string) => void;
  rewriteSection: (
    id: string,
    mode: "expand" | "shorten" | "polish" | OutputStyle,
  ) => void;
  regenerateSection: (id: string) => void;
  submitApprovalFlow: () => void;
  simulateReview: (approve: boolean) => void;
  exportDoc: (format: "word" | "ppt" | "pdf") => ExportPreview;
  copyFullText: () => string;
  activeSource: SourceMaterial | null;
  openSource: (id: string) => void;
  closeSource: () => void;
  exportToast: string | null;
  clearExportToast: () => void;
}

const DocumentContext = createContext<DocumentContextValue | null>(null);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<DocView>("picker");
  const [document, setDocument] = useState<GeneratedDocument | null>(null);
  const [activeSource, setActiveSource] = useState<SourceMaterial | null>(null);
  const [exportToast, setExportToast] = useState<string | null>(null);

  const selectType = useCallback((type: DocumentType) => {
    const form = defaultFormValues(type) as DocumentForm;
    setDocument(createDocument(type, form));
    setView("form");
  }, []);

  const updateForm = useCallback((key: string, value: string) => {
    setDocument((prev) =>
      prev ? { ...prev, form: { ...prev.form, [key]: value }, updatedAt: new Date().toISOString() } : null,
    );
  }, []);

  const generateOutline = useCallback(() => {
    setDocument((prev) => {
      if (!prev) return null;
      const outline = generateDocumentOutline(prev.type, prev.form);
      return {
        ...prev,
        outline,
        updatedAt: new Date().toISOString(),
      };
    });
    setView("outline");
  }, []);

  const moveOutline = useCallback((index: number, direction: -1 | 1) => {
    setDocument((prev) => {
      if (!prev) return null;
      const sections = [...prev.outline.sections];
      const target = index + direction;
      if (target < 0 || target >= sections.length) return prev;
      [sections[index], sections[target]] = [sections[target], sections[index]];
      return {
        ...prev,
        outline: { sections },
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const generateBody = useCallback(() => {
    setDocument((prev) => {
      if (!prev) return null;
      const sections = buildSectionsFromOutline(
        prev.outline,
        prev.form,
        prev.style,
      );
      return {
        ...prev,
        sections,
        updatedAt: new Date().toISOString(),
      };
    });
    setView("editor");
  }, []);

  const updateSection = useCallback((id: string, content: string) => {
    setDocument((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === id ? { ...s, content, status: "edited" as const } : s,
        ),
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const rewriteSection = useCallback(
    (id: string, mode: "expand" | "shorten" | "polish" | OutputStyle) => {
      setDocument((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sections: prev.sections.map((s) =>
            s.id === id
              ? {
                  ...s,
                  content: rewriteContent(s.content, mode),
                  status: "edited" as const,
                }
              : s,
          ),
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [],
  );

  const regenerateSection = useCallback((id: string) => {
    setDocument((prev) => {
      if (!prev) return null;
      const sec = prev.sections.find((s) => s.id === id);
      const outlineSec = prev.outline.sections.find(
        (o) => o.id === sec?.outlineId,
      );
      if (!outlineSec || !sec) return prev;
      const sources = findRelevantSources(outlineSec);
      const { content, citations } = generateSectionContent(
        outlineSec,
        prev.form,
        sources,
        prev.style,
      );
      return {
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === id
            ? { ...s, content, citations, status: "generated" as const }
            : s,
        ),
      };
    });
  }, []);

  const submitApprovalFlow = useCallback(() => {
    setDocument((prev) => {
      if (!prev) return null;
      const { status, record } = submitForApproval(prev);
      return {
        ...prev,
        approvalStatus: status,
        approvalHistory: [...prev.approvalHistory, record],
      };
    });
  }, []);

  const simulateReview = useCallback((approve: boolean) => {
    setDocument((prev) => {
      if (!prev) return null;
      const record = simulateApprovalStep(prev, approve);
      return {
        ...prev,
        approvalStatus: record.status,
        approvalHistory: [...prev.approvalHistory, record],
      };
    });
  }, []);

  const exportDoc = useCallback(
    (format: "word" | "ppt" | "pdf") => {
      if (!document) {
        return {
          format,
          filename: "",
          pageCount: 0,
          message: "",
        };
      }
      const preview = generateExportPreview(document, format);
      setExportToast(preview.message);
      return preview;
    },
    [document],
  );

  const copyFullText = useCallback(
    () => (document ? assembleFullText(document) : ""),
    [document],
  );

  const value = useMemo(
    () => ({
      view,
      setView,
      document,
      selectType,
      updateForm,
      generateOutline,
      moveOutline,
      generateBody,
      updateSection,
      rewriteSection,
      regenerateSection,
      submitApprovalFlow,
      simulateReview,
      exportDoc,
      copyFullText,
      activeSource,
      openSource: (id: string) => setActiveSource(getSourceById(id) ?? null),
      closeSource: () => setActiveSource(null),
      exportToast,
      clearExportToast: () => setExportToast(null),
    }),
    [
      view,
      document,
      selectType,
      updateForm,
      generateOutline,
      moveOutline,
      generateBody,
      updateSection,
      rewriteSection,
      regenerateSection,
      submitApprovalFlow,
      simulateReview,
      exportDoc,
      copyFullText,
      activeSource,
      exportToast,
    ],
  );

  return (
    <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>
  );
}

export function useDocument() {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error("useDocument within DocumentProvider");
  return ctx;
}
