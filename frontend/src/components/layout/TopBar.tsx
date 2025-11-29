

// frontend/src/components/layout/TopBar.tsx

export const TopBar = () => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div>
          <div className="topbar-title">Trading Workflow Studio</div>
          <div className="topbar-caption">
            Design, validate, and run automated trading flows.
          </div>
        </div>
      </div>
      <div className="topbar-right">
        <button className="topbar-btn topbar-btn-secondary">Docs</button>
        <button className="topbar-btn topbar-btn-primary">
          Connect Exchange
        </button>
      </div>
    </header>
  );
};

