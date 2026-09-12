import { lazy, Suspense, useEffect, useState } from "react";
import Landing from "./workspace/Landing";
import { DISTRICTS, restoreManager } from "./workspace/districts";
import "./workspace/earth.css";

export default function App() {
  const [manager, setManager] = useState(restoreManager);

  function enter(district, session) {
    setManager(session);
    try {
      if (session) {
        sessionStorage.setItem("tg_demo_manager_v1", JSON.stringify(session));
        localStorage.setItem("tg_analyst_name", `${session.name} (demo)`);
      }
    } catch {
      /* Storage restrictions do not prevent navigation. */
    }
  }

  return (
    <Landing onEnter={enter} manager={manager} />
  );
}
