import { Navigate, type RouteObject } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/home/page";
import BoardPage from "@/pages/board/page";
import PostPage from "@/pages/post/page";
import WritePage from "@/pages/write/page";
import AboutPage from "@/pages/about/page";
import CategoryPage from "@/pages/category/page";
import ExplorePage from "@/pages/explore/page";
import BoardsPage from "@/pages/boards/page";
import RegionPage from "@/pages/region/page";
import NationPage from "@/pages/nation/page";
import PeoplePage from "@/pages/people/page";
import EventsPage from "@/pages/events/page";
import AuthPage from "@/pages/auth/page";
import ForgotPasswordPage from "@/pages/auth/forgot-password/page";
import ResetPasswordPage from "@/pages/auth/reset-password/page";
import MyPage from "@/pages/my/page";
import RoomPage from "@/pages/room/page";
import VisitRoomPage from "@/pages/room/visit/page";
import DeskPage from "@/pages/desk/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/explore",
    element: <ExplorePage />,
  },
  {
    path: "/boards",
    element: <BoardsPage />,
  },
  {
    path: "/region",
    element: <RegionPage />,
  },
  {
    path: "/nation",
    element: <NationPage />,
  },
  {
    path: "/local-ads",
    element: <Navigate to="/region" replace />,
  },
  {
    path: "/category/:slug",
    element: <CategoryPage />,
  },
  {
    path: "/people",
    element: <PeoplePage />,
  },
  {
    path: "/events",
    element: <EventsPage />,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/auth/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/auth/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/my",
    element: <MyPage />,
  },
  {
    path: "/room",
    element: <RoomPage />,
  },
  {
    path: "/room/:username",
    element: <VisitRoomPage />,
  },
  {
    path: "/board/:slug",
    element: <BoardPage />,
  },
  {
    path: "/board/:slug/write",
    element: <WritePage />,
  },
  {
    path: "/board/:slug/:postId/edit",
    element: <WritePage />,
  },
  {
    path: "/board/:slug/:postId",
    element: <PostPage />,
  },
  {
    path: "/write",
    element: <WritePage />,
  },
  {
    path: "/desk",
    element: <DeskPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;