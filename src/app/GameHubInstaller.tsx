"use client";
import { useEffect } from "react";
import { installGameHub } from "@/games/hub/installGameHub";

export default function GameHubInstaller() {
  useEffect(() => {
    installGameHub();
  }, []);
  return null;
}
