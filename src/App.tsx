/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnimatedAiInput } from "./components/animated-ai-input";
import { TopDock } from "./components/top-dock";
import { Sidebar } from "./components/sidebar";
import { ChatProvider } from "./lib/chat-context";
import { FlickeringGridDemo } from "./components/flickering-grid-demo";
import { ThemeProvider } from "./lib/theme-context";
import { DynamicSVG } from "./components/DynamicSVG";

export default function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <div className="min-h-screen bg-[#f8f9fc] text-[#0e1745] dark:bg-mesh dark:text-white font-sans selection:bg-[#1534dc]/20 dark:selection:bg-[#FF00FF]/30 relative overflow-hidden transition-colors duration-500">
          {/* Subtle grid background */}
          <div 
            className="absolute inset-0 z-0 pointer-events-none opacity-10 dark:opacity-20 transition-opacity duration-500"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='currentColor' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
            }}
          />

          {/* Flickering Grid Background */}
          <div className="hidden dark:block">
            <FlickeringGridDemo />
          </div>

          {/* Central Logo */}
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-white/60 dark:glass-dark backdrop-blur-md border border-white/50 dark:border-white/10 px-4 py-2 rounded-full shadow-sm flex items-center justify-center min-w-[100px] h-[40px]">
              <DynamicSVG path="/logo.svg" className="h-5 w-auto" />
            </div>
          </div>

          {/* Sidebar */}
          <Sidebar />

          {/* Top Liquidglass Dock */}
          <TopDock />

          {/* Main Content */}
          <main className="flex flex-col items-center h-screen p-6 relative z-10 overflow-hidden">
            <div className="w-full max-w-4xl flex flex-col flex-1 h-full min-h-0">
              <AnimatedAiInput />
            </div>
          </main>
        </div>
      </ChatProvider>
    </ThemeProvider>
  );
}
