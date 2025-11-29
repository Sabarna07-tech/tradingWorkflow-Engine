// frontend/src/App.tsx
import { TopBar } from "./components/layout/TopBar";
import { WorkflowBuilderPage } from "./pages/WorkflowBuilderPage";

function App() {
  return (
    <div className="app-root">
      <TopBar />
      <WorkflowBuilderPage />
    </div>
  );
}

export default App;
