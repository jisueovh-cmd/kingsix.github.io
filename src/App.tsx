import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider } from "@/hooks/useAuth";
import { PresenceProvider } from "@/hooks/usePresence";
import { ReactionsProvider } from "@/hooks/useReactions";
import { ToastProvider } from "@/components/feature/ToastProvider";
import RouteSeo from "@/components/feature/RouteSeo";
import MobileTabBar from "@/components/feature/MobileTabBar";
import ScrollToTop from "@/components/feature/ScrollToTop";


function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <PresenceProvider>
          <ReactionsProvider>
            <ToastProvider>
              <BrowserRouter basename={__BASE_PATH__}>
                <ScrollToTop />
                <RouteSeo />
                <AppRoutes />
                <MobileTabBar />
              </BrowserRouter>
            </ToastProvider>
          </ReactionsProvider>
        </PresenceProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;