"use client";

import { DocumentProvider, useDocument } from "./document-context";
import { TypePicker } from "./components/type-picker";
import { FormView } from "./components/form-view";
import { OutlineView } from "./components/outline-view";
import { EditorView } from "./components/editor-view";

function DocumentGenApp() {
  const { view } = useDocument();

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {view === "picker" && <TypePicker />}
      {view === "form" && <FormView />}
      {view === "outline" && <OutlineView />}
      {view === "editor" && <EditorView />}
    </div>
  );
}

export default function DocumentGenDemo() {
  return (
    <DocumentProvider>
      <DocumentGenApp />
    </DocumentProvider>
  );
}
